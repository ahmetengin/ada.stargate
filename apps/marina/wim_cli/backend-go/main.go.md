package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"sync"

	"github.com/gorilla/websocket"
	"github.com/redis/go-redis/v9"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all CORS for this demo
	},
}

type Gateway struct {
	rdb     *redis.Client
	clients map[*websocket.Conn]bool
	lock    sync.Mutex
	ctx     context.Context
}

type Message struct {
	Type    string `json:"type"`
	Payload string `json:"payload"`
}

func newGateway() *Gateway {
	redisUrl := os.Getenv("REDIS_URL")
	if redisUrl == "" {
		redisUrl = "redis://localhost:6379"
	}

	opts, err := redis.ParseURL(redisUrl)
	if err != nil {
		log.Fatal("Invalid Redis URL")
	}

	return &Gateway{
		rdb:     redis.NewClient(opts),
		clients: make(map[*websocket.Conn]bool),
		ctx:     context.Background(),
	}
}

func (g *Gateway) handleConnections(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WS Upgrade Error: %v", err)
		return
	}
	defer ws.Close()

	g.lock.Lock()
	g.clients[ws] = true
	g.lock.Unlock()

	log.Println("New Client Connected")

	for {
		var msg Message
		// Read message from browser/client
		err := ws.ReadJSON(&msg)
		if err != nil {
			g.lock.Lock()
			delete(g.clients, ws)
			g.lock.Unlock()
			break
		}

		// Forward user input to Redis Channel "ada_input" for Python Brain to process
		// Python Logic: Subscribes to "ada_input", processes via LangGraph, Publishes to "ada_events"
		if msg.Type == "text" {
			err = g.rdb.Publish(g.ctx, "ada_input", msg.Payload).Err()
			if err != nil {
				log.Printf("Redis Publish Error: %v", err)
			}
		}
	}
}

func (g *Gateway) handleMessages() {
	// Subscribe to "ada_events" channel from Python Backend
	pubsub := g.rdb.Subscribe(g.ctx, "ada_events")
	defer pubsub.Close()

	ch := pubsub.Channel()

	for msg := range ch {
		// Broadcast the message to all connected WebSocket clients
		g.lock.Lock()
		for client := range g.clients {
			err := client.WriteJSON(Message{
				Type:    "response",
				Payload: msg.Payload,
			})
			if err != nil {
				log.Printf("WS Write Error: %v", err)
				client.Close()
				delete(g.clients, client)
			}
		}
		g.lock.Unlock()
	}
}

func main() {
	gateway := newGateway()

	// Start listening to Redis in a goroutine
	go gateway.handleMessages()

	http.HandleFunc("/ws", gateway.handleConnections)

	port := "8080"
	log.Printf("🚀 Ada Gateway (Go) started on port %s", port)
	err := http.ListenAndServe(":"+port, nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
