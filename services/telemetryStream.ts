
// services/telemetryStream.ts

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
        // CRITICAL FIX: If on HTTPS, we MUST use WSS. Browser will block WS.
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        const wsUrl = `${protocol}//${host}/ws/telemetry`;

        // Only log connection attempts occasionally to reduce noise
        if (this.retryCount === 0 || this.retryCount % 5 === 0) {
            console.debug(`[Telemetry] Connecting to ${wsUrl} (Attempt ${this.retryCount + 1})...`);
        }

        try {
            this.socket = new WebSocket(wsUrl);
        } catch (error) {
            // If constructor throws (e.g. syntax error), handle gracefully
            this.handleReconnect();
            return;
        }

        this.socket.onopen = () => {
            console.log("📡 Telemetry Stream Connected");
            this.retryCount = 0; // Reset backoff on successful connection
        };

        this.socket.onmessage = (event) => {
            if (!event.data) return;
            try {
                const data = JSON.parse(event.data);
                this.notifyListeners(data);
            } catch (e) {
                // Silent fail on parse error
            }
        };

        this.socket.onclose = (event) => {
            this.socket = null; // Clean up reference
            this.handleReconnect();
        };

        this.socket.onerror = (err) => {
            // WebSocket errors are often uninformative in JS. 
            // We just ensure socket is closed to trigger cleanup.
            if (this.socket && this.socket.readyState !== WebSocket.CLOSED) {
                this.socket.close();
            }
        };
    }

    private handleReconnect() {
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);

        // Exponential Backoff: 1s, 2s, 4s, 8s... up to 30s
        // This prevents "9 errors" appearing instantly.
        const delay = Math.min(1000 * Math.pow(2, this.retryCount), this.maxRetryDelay);
        
        this.reconnectTimer = setTimeout(() => {
            this.retryCount++;
            this.connect();
        }, delay);
    }

    subscribe(callback: TelemetryCallback) {
        this.listeners.push(callback);
        // Ensure connection is active when someone subscribes
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            this.connect(); // Reset retry count for manual subscription triggers? No, keep logic simple.
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
