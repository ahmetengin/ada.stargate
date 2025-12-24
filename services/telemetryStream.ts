// services/telemetryStream.ts

export type TelemetryCallback = (data: any) => void;
export type StatusCallback = (isConnected: boolean) => void;

class TelemetryStreamService {
    private socket: WebSocket | null = null;
    private listeners: TelemetryCallback[] = [];
    private statusListeners: StatusCallback[] = [];
    private retryCount = 0;
    private readonly baseDelay = 1000;
    private readonly maxRetryDelay = 30000; 
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private isConnecting = false;
    private connectionCount = 0;

    /**
     * Initiates a connection to the telemetry WebSocket endpoint.
     * Uses relative URL construction to adapt to Nginx/Vite proxies automatically.
     */
    connect() {
        if (this.isConnecting) return;
        
        if (typeof window === 'undefined') return;

        // Clean up previous socket if it exists and isn't active
        if (this.socket) {
            if (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING) {
                return;
            }
            this.cleanupSocket();
        }

        this.isConnecting = true;

        // --- DYNAMIC URL CONSTRUCTION ---
        // Prevents localhost:8000 errors by hitting the app's own gateway
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host; 
        const wsUrl = `${protocol}//${host}/ws/telemetry`;

        try {
            console.debug(`[Telemetry] Attempting connection to ${wsUrl} (Attempt ${this.retryCount + 1})`);
            this.socket = new WebSocket(wsUrl);
            this.setupSocketHandlers(wsUrl);
        } catch (error) {
            this.isConnecting = false;
            console.error(`[Telemetry] WebSocket initialization failed:`, error);
            this.handleReconnect();
        }
    }

    private setupSocketHandlers(wsUrl: string) {
        if (!this.socket) return;

        this.socket.onopen = () => {
            this.connectionCount++;
            console.log(`📡 Telemetry Stream Connected (Session #${this.connectionCount})`);
            this.isConnecting = false;
            this.retryCount = 0;
            this.notifyStatusListeners(true);
            
            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer);
                this.reconnectTimer = null;
            }
        };

        this.socket.onmessage = (event) => {
            if (!event.data) return;
            try {
                const data = JSON.parse(event.data);
                this.notifyListeners(data);
            } catch (e) {
                // Ignore non-JSON system messages
            }
        };

        this.socket.onclose = (event) => {
            this.isConnecting = false;
            this.notifyStatusListeners(false);
            
            // Don't retry if the code is 1000 (Normal Closure)
            if (event.code !== 1000) { 
                console.warn(`[Telemetry] Connection lost (Code ${event.code}). Initiating jittered backoff.`);
                this.handleReconnect();
            }
            this.socket = null;
        };

        this.socket.onerror = (error) => {
            this.isConnecting = false;
            console.error(`[Telemetry] WebSocket Transport Error.`);
        };
    }

    /**
     * Exponential backoff with Full Jitter.
     * Prevents synchronized retry storms from multiple clients.
     */
    private handleReconnect() {
        if (this.reconnectTimer) return;

        const exponentialDelay = Math.min(this.baseDelay * Math.pow(2, this.retryCount), this.maxRetryDelay);
        // FULL JITTER: Random distribution between 0 and exponentialDelay
        const jitteredDelay = Math.random() * exponentialDelay;

        this.reconnectTimer = setTimeout(() => {
            this.retryCount++;
            this.reconnectTimer = null;
            this.connect();
        }, jitteredDelay);
    }

    private cleanupSocket() {
        if (this.socket) {
            this.socket.onopen = null;
            this.socket.onmessage = null;
            this.socket.onclose = null;
            this.socket.onerror = null;
            if (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING) {
                this.socket.close(1000, "Cleanup");
            }
            this.socket = null;
        }
    }

    subscribe(callback: TelemetryCallback): () => void {
        if (!this.listeners.includes(callback)) {
            this.listeners.push(callback);
        }
        
        if (!this.socket && !this.reconnectTimer) {
            this.connect();
        }
        
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }
    
    onStatusChange(callback: StatusCallback): () => void {
        this.statusListeners.push(callback);
        callback(this.socket?.readyState === WebSocket.OPEN);
        return () => {
            this.statusListeners = this.statusListeners.filter(l => l !== callback);
        }
    }

    private notifyListeners(data: any) {
        this.listeners.forEach(l => {
            try { l(data); } catch (e) { console.error("[Telemetry] Listener fault:", e); }
        });
    }

    private notifyStatusListeners(isConnected: boolean) {
        this.statusListeners.forEach(l => {
            try { l(isConnected); } catch (e) {}
        });
    }
}

export const telemetryStream = new TelemetryStreamService();