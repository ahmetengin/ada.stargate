
// services/core/telemetryStream.ts

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

    connect() {
        if (this.isConnecting || typeof window === 'undefined') return;

        if (this.socket) {
            if (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING) {
                return;
            }
            this.cleanupSocket();
        }

        this.isConnecting = true;
        const loc = window.location;
        const protocol = loc.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = loc.host || 'localhost:8000'; 
        const wsUrl = `${protocol}//${host}/ws/telemetry`;

        try {
            this.socket = new WebSocket(wsUrl);
            this.setupSocketHandlers();
        } catch (error) {
            this.isConnecting = false;
            this.handleReconnect();
        }
    }

    private setupSocketHandlers() {
        if (!this.socket) return;

        this.socket.onopen = () => {
            this.isConnecting = false;
            this.retryCount = 0;
            this.notifyStatusListeners(true);
        };

        this.socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.notifyListeners(data);
            } catch (e) {}
        };

        this.socket.onclose = (event) => {
            this.isConnecting = false;
            this.notifyStatusListeners(false);
            if (event.code !== 1000) this.handleReconnect();
            this.socket = null;
        };

        this.socket.onerror = () => {
            this.isConnecting = false;
        };
    }

    private handleReconnect() {
        if (this.reconnectTimer) return;
        const delay = Math.min(this.baseDelay * Math.pow(2, this.retryCount), this.maxRetryDelay);
        this.reconnectTimer = setTimeout(() => {
            this.retryCount++;
            this.reconnectTimer = null;
            this.connect();
        }, delay * (0.8 + Math.random() * 0.4));
    }

    private cleanupSocket() {
        if (this.socket) {
            this.socket.onopen = null;
            this.socket.onmessage = null;
            this.socket.onclose = null;
            this.socket.onerror = null;
            this.socket.close();
            this.socket = null;
        }
    }

    subscribe(callback: TelemetryCallback): () => void {
        this.listeners.push(callback);
        if (!this.socket && !this.reconnectTimer) this.connect();
        return () => { this.listeners = this.listeners.filter(l => l !== callback); };
    }
    
    onStatusChange(callback: StatusCallback): () => void {
        this.statusListeners.push(callback);
        callback(this.socket?.readyState === WebSocket.OPEN);
        return () => { this.statusListeners = this.statusListeners.filter(l => l !== callback); }
    }

    private notifyListeners(data: any) { this.listeners.forEach(l => l(data)); }
    private notifyStatusListeners(isConnected: boolean) { this.statusListeners.forEach(l => l(isConnected)); }
}

export const telemetryStream = new TelemetryStreamService();
