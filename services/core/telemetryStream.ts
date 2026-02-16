
// services/core/telemetryStream.ts

export type TelemetryCallback = (data: any) => void;
export type StatusCallback = (isConnected: boolean) => void;

class TelemetryStreamService {
    private socket: WebSocket | null = null;
    private listeners: TelemetryCallback[] = [];
    private statusListeners: StatusCallback[] = [];
    private retryCount = 0;
    private readonly baseDelay = 2000;
    private readonly maxRetryDelay = 30000; 
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private isConnecting = false;

    connect() {
        // Prevent multiple simultaneous connection attempts
        if (this.isConnecting) return;
        
        if (typeof window === 'undefined') return;

        // Clean up previous socket if needed
        if (this.socket) {
            if (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING) {
                return;
            }
            this.socket = null;
        }

        this.isConnecting = true;
        
        // Protocol detection
        const loc = window.location;
        const protocol = loc.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = loc.host || 'localhost:3000'; 
        const wsUrl = `${protocol}//${host}/ws/telemetry`;

        try {
            this.socket = new WebSocket(wsUrl);
            
            this.socket.onopen = () => {
                console.log("[Telemetry] Connected to OneNet Stream.");
                this.isConnecting = false;
                this.retryCount = 0;
                this.notifyStatusListeners(true);
            };

            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.notifyListeners(data);
                } catch (e) {
                    // Ignore malformed packets
                }
            };

            this.socket.onclose = (event) => {
                this.isConnecting = false;
                this.notifyStatusListeners(false);
                // Don't retry if closed cleanly (1000)
                if (event.code !== 1000) {
                    this.handleReconnect();
                }
            };

            this.socket.onerror = (err) => {
                this.isConnecting = false;
                // Silent fail on error, handle in close
            };
        } catch (error) {
            this.isConnecting = false;
            this.handleReconnect();
        }
    }

    private handleReconnect() {
        if (this.reconnectTimer) return;
        
        const delay = Math.min(this.baseDelay * Math.pow(1.5, this.retryCount), this.maxRetryDelay);
        console.debug(`[Telemetry] Reconnecting in ${delay}ms...`);
        
        this.reconnectTimer = setTimeout(() => {
            this.retryCount++;
            this.reconnectTimer = null;
            this.connect();
        }, delay);
    }

    subscribe(callback: TelemetryCallback): () => void {
        this.listeners.push(callback);
        // Lazy connect
        if (!this.socket && !this.isConnecting) {
            this.connect();
        }
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }
    
    onStatusChange(callback: StatusCallback): () => void {
        this.statusListeners.push(callback);
        if(this.socket) callback(this.socket.readyState === WebSocket.OPEN);
        return () => {
            this.statusListeners = this.statusListeners.filter(l => l !== callback);
        }
    }

    private notifyListeners(data: any) { this.listeners.forEach(l => l(data)); }
    private notifyStatusListeners(isConnected: boolean) { this.statusListeners.forEach(l => l(isConnected)); }
}

export const telemetryStream = new TelemetryStreamService();
