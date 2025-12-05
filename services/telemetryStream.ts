
export type TelemetryCallback = (data: any) => void;

class TelemetryStreamService {
    private socket: WebSocket | null = null;
    private listeners: TelemetryCallback[] = [];
    private retryCount = 0;
    private maxRetryDelay = 30000; // Cap backoff at 30 seconds
    private reconnectTimer: any = null;

    connect() {
        // Prevent multiple simultaneous connection attempts
        if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
            return;
        }

        // Secure WebSocket Protocol Selection
        const isSecure = window.location.protocol === 'https:' || window.location.protocol.includes('https');
        const protocol = isSecure ? 'wss:' : 'ws:';
        
        // Robust host detection with fallback for sandboxed environments
        const host = window.location.host || 'localhost';
        
        // Construct URL
        const wsUrl = `${protocol}//${host}/ws/telemetry`;

        // Removed debug console.log for telemetry connection attempts
        // if (this.retryCount === 0 || this.retryCount % 5 === 0) {
        //     console.debug(`[Telemetry] Connecting to ${wsUrl} (Attempt ${this.retryCount + 1})...`);
        // }

        try {
            this.socket = new WebSocket(wsUrl);
        } catch (error) {
            console.warn("[Telemetry] Socket constructor failed:", error);
            this.handleReconnect();
            return;
        }

        this.socket.onopen = () => {
            console.log("📡 Telemetry Stream Connected");
            this.retryCount = 0;
        };

        this.socket.onmessage = (event) => {
            if (!event.data) return;
            try {
                // Protect against malformed JSON from the server
                const data = JSON.parse(event.data);
                this.notifyListeners(data);
            } catch (e) {
                console.warn("[Telemetry] Malformed message received:", e);
            }
        };

        this.socket.onclose = (event) => {
            this.socket = null;
            if (event.code !== 1000) {
                this.handleReconnect();
            }
        };

        this.socket.onerror = (err) => {
            if (this.socket && this.socket.readyState !== WebSocket.CLOSED) {
                this.socket.close();
            }
        };
    }

    private handleReconnect() {
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);

        const delay = Math.min(1000 * Math.pow(2, this.retryCount), this.maxRetryDelay);
        
        this.reconnectTimer = setTimeout(() => {
            this.retryCount++;
            this.connect();
        }, delay);
    }

    subscribe(callback: TelemetryCallback) {
        this.listeners.push(callback);
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            this.connect();
        }
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
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
}

export const telemetryStream = new TelemetryStreamService();
