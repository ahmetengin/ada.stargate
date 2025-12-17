
export type TelemetryCallback = (data: any) => void;
export type StatusCallback = (isConnected: boolean) => void;

class TelemetryStreamService {
    private socket: WebSocket | null = null;
    private listeners: TelemetryCallback[] = [];
    private statusListeners: StatusCallback[] = [];
    private retryCount = 0;
    private maxRetryDelay = 30000; // Cap backoff at 30 seconds
    private reconnectTimer: any = null;

    connect() {
        if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
            return;
        }

        // This logic is critical and correct for handling HTTPS environments.
        // It prevents "mixed content" errors by matching the WebSocket protocol (wss/ws)
        // to the page's protocol (https/http).
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        
        const wsUrl = `${protocol}//${host}/ws/telemetry`;
        console.log(`[Telemetry] Attempting to connect to: ${wsUrl}`);

        try {
            this.socket = new WebSocket(wsUrl);
        } catch (error) {
            console.error("[Telemetry] WebSocket constructor failed:", error);
            this.handleReconnect();
            return;
        }

        this.socket.onopen = () => {
            console.log("📡 Telemetry Stream Connected");
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
                console.warn("[Telemetry] Malformed message received:", e);
            }
        };

        this.socket.onclose = (event) => {
            this.notifyStatusListeners(false);
            console.log(`[Telemetry] WebSocket closed (Code: ${event.code}). Reconnecting...`);
            this.socket = null;
            if (event.code !== 1000) { // Don't reconnect on normal close
                this.handleReconnect();
            }
        };

        this.socket.onerror = (err) => {
            console.error("[Telemetry] WebSocket error:", err);
            this.notifyStatusListeners(false);
            if (this.socket && this.socket.readyState !== WebSocket.CLOSED) {
                this.socket.close();
            }
        };
    }

    private handleReconnect() {
        if (this.reconnectTimer) return;

        const delay = Math.min(1000 * Math.pow(2, this.retryCount), this.maxRetryDelay);
        
        this.reconnectTimer = setTimeout(() => {
            this.retryCount++;
            this.reconnectTimer = null;
            this.connect();
        }, delay);
    }

    subscribe(callback: TelemetryCallback): () => void {
        this.listeners.push(callback);
        if (!this.socket && !this.reconnectTimer) {
            this.connect();
        }
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }
    
    onStatusChange(callback: StatusCallback): () => void {
        this.statusListeners.push(callback);
        if (this.socket) {
            callback(this.socket.readyState === WebSocket.OPEN);
        } else {
            callback(false);
        }
        return () => {
            this.statusListeners = this.statusListeners.filter(l => l !== callback);
        }
    }

    private notifyListeners(data: any) {
        this.listeners.forEach(listener => {
            try {
                listener(data);
            } catch (error) {
                console.error("[Telemetry] Listener callback failed:", error);
            }
        });
    }

    private notifyStatusListeners(isConnected: boolean) {
        this.statusListeners.forEach(listener => {
            try {
                listener(isConnected);
            } catch (error) {
                console.error("[Telemetry] Status listener callback failed:", error);
            }
        });
    }
}

export const telemetryStream = new TelemetryStreamService();
