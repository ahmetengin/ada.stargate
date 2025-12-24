
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
     * Crucially forces wss: if the page is loaded over https: to prevent 
     * Mixed Content security errors in browser.
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

        // --- SECURE PROTOCOL SELECTION ---
        // Force wss: if the page is loaded over https:
        // Use strict check against 'https:' which is the standard value of window.location.protocol
        const isSecure = window.location.protocol === 'https:';
        const protocol = isSecure ? 'wss:' : 'ws:';
        const host = window.location.host; 
        
        // Construct the URL using standard relative logic
        const wsUrl = `${protocol}//${host}/ws/telemetry`;

        try {
            console.debug(`[Telemetry] Initializing WebSocket connection: ${wsUrl}`);
            this.socket = new WebSocket(wsUrl);
            this.setupSocketHandlers();
        } catch (error) {
            this.isConnecting = false;
            console.error(`[Telemetry] WebSocket instance creation failed:`, error);
            this.handleReconnect();
        }
    }

    private setupSocketHandlers() {
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
                // Ignore silent parsing errors for non-telemetry packets
            }
        };

        this.socket.onclose = (event) => {
            this.isConnecting = false;
            this.notifyStatusListeners(false);
            
            // Retry unless closed intentionally (code 1000)
            if (event.code !== 1000) { 
                console.warn(`[Telemetry] Connection closed (Code ${event.code}). Retrying...`);
                this.handleReconnect();
            }
            this.socket = null;
        };

        this.socket.onerror = (error) => {
            this.isConnecting = false;
            console.error(`[Telemetry] WebSocket transport error detected.`);
        };
    }

    private handleReconnect() {
        if (this.reconnectTimer) return;

        const delay = Math.min(this.baseDelay * Math.pow(2, this.retryCount), this.maxRetryDelay);
        const jitteredDelay = delay * (0.5 + Math.random());

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
                this.socket.close(1000, "Component Cleanup");
            }
            this.socket = null;
        }
    }

    subscribe(callback: TelemetryCallback): () => void {
        if (!this.listeners.includes(callback)) {
            this.listeners.push(callback);
        }
        
        // Auto-connect on first subscriber
        if (!this.socket && !this.reconnectTimer) {
            this.connect();
        }
        
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }
    
    onStatusChange(callback: StatusCallback): () => void {
        this.statusListeners.push(callback);
        // Instant sync for new listener
        callback(this.socket?.readyState === WebSocket.OPEN);
        return () => {
            this.statusListeners = this.statusListeners.filter(l => l !== callback);
        }
    }

    private notifyListeners(data: any) {
        this.listeners.forEach(l => {
            try { l(data); } catch (e) {}
        });
    }

    private notifyStatusListeners(isConnected: boolean) {
        this.statusListeners.forEach(l => {
            try { l(isConnected); } catch (e) {}
        });
    }
}

export const telemetryStream = new TelemetryStreamService();
