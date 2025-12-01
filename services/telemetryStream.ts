
// services/telemetryStream.ts

export type TelemetryCallback = (data: any) => void;

class TelemetryStreamService {
    private socket: WebSocket | null = null;
    private listeners: TelemetryCallback[] = [];
    private retryCount = 0;
    private maxRetryDelay = 30000; // Cap backoff at 30 seconds

    connect() {
        // Prevent multiple simultaneous connection attempts
        if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
            return;
        }

        // Secure WebSocket Protocol Selection
        const isSecure = window.location.protocol === 'https:';
        const scheme = isSecure ? 'wss' : 'ws';
        const host = window.location.host;
        const wsUrl = `${scheme}://${host}/ws/telemetry`;

        console.debug(`[Telemetry] Connecting to ${wsUrl} (Attempt ${this.retryCount + 1})...`);

        try {
            this.socket = new WebSocket(wsUrl);
        } catch (error) {
            console.error("[Telemetry] Critical: Connection creation failed immediately:", error);
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
                console.warn("[Telemetry] Failed to parse incoming message:", event.data, e);
            }
        };

        this.socket.onclose = (event) => {
            console.log(`[Telemetry] Connection closed (Code: ${event.code}, Reason: ${event.reason || 'No reason provided'})`);
            this.socket = null; // Clean up reference
            this.handleReconnect();
        };

        this.socket.onerror = (err) => {
            // Note: WebSocket errors in JS are often minimal for security, but we log what we get.
            console.error("[Telemetry] Socket encountered error:", err);
            // Ensure socket is closed to trigger cleanup and reconnection logic via onclose
            if (this.socket && this.socket.readyState !== WebSocket.CLOSED) {
                this.socket.close();
            }
        };
    }

    private handleReconnect() {
        // Exponential Backoff: 1s, 1.5s, 2.25s... up to 30s
        const delay = Math.min(1000 * Math.pow(1.5, this.retryCount), this.maxRetryDelay);
        
        console.debug(`[Telemetry] Reconnecting in ${delay}ms...`);
        
        setTimeout(() => {
            this.retryCount++;
            this.connect();
        }, delay);
    }

    subscribe(callback: TelemetryCallback) {
        this.listeners.push(callback);
        // Ensure connection is active when someone subscribes
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
