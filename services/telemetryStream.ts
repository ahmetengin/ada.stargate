
// services/telemetryStream.ts

export type TelemetryCallback = (data: any) => void;

class TelemetryStreamService {
    private socket: WebSocket | null = null;
    private listeners: TelemetryCallback[] = [];
    private reconnectInterval = 5000;

    connect() {
        if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
            return;
        }

        // Strict Mixed Content Check: If we are on HTTPS, we MUST use WSS.
        const isSecure = window.location.protocol === 'https:';
        const protocol = isSecure ? 'wss:' : 'ws:';
        const host = window.location.host;
        const wsUrl = `${protocol}//${host}/ws/telemetry`;

        console.debug(`[Telemetry] Connecting to ${wsUrl}`);

        try {
            this.socket = new WebSocket(wsUrl);
        } catch (error) {
            console.error("[Telemetry] Connection creation failed:", error);
            return;
        }

        this.socket.onopen = () => {
            console.log("📡 Telemetry Stream Connected");
        };

        this.socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.notifyListeners(data);
            } catch (e) {
                console.warn("Telemetry parse error", e);
            }
        };

        this.socket.onclose = () => {
            console.log("Telemetry Stream Disconnected. Reconnecting...");
            setTimeout(() => this.connect(), this.reconnectInterval);
        };

        this.socket.onerror = (err) => {
            console.error("Telemetry Socket Error. Ensure backend is running and Nginx/Vite is proxying /ws correctly.", err);
            this.socket?.close();
        };
    }

    subscribe(callback: TelemetryCallback) {
        this.listeners.push(callback);
        // Ensure connection is active when someone subscribes
        this.connect();
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    private notifyListeners(data: any) {
        this.listeners.forEach(listener => listener(data));
    }
}

export const telemetryStream = new TelemetryStreamService();
