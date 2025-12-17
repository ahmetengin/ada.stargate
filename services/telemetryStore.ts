import { create } from 'zustand';
import { TelemetryEvent, Severity } from '../types';
import { telemetryStream } from './telemetryStream';

interface TelemetryState {
    events: TelemetryEvent[];
    isConnected: boolean;
    activeAlerts: number;
    addEvent: (event: TelemetryEvent) => void;
    setConnected: (status: boolean) => void;
    clearEvents: () => void;
}

export const useTelemetryStore = create<TelemetryState>((set) => ({
    events: [],
    isConnected: false,
    activeAlerts: 0,

    addEvent: (event) => set((state) => {
        const newEvents = [event, ...state.events].slice(0, 100);
        const activeAlerts = newEvents.filter(e => 
            e.severity === 'critical' || e.severity === 'error'
        ).length;

        return { 
            events: newEvents,
            activeAlerts
        };
    }),

    setConnected: (status) => set({ isConnected: status }),
    
    clearEvents: () => set({ events: [], activeAlerts: 0 })
}));

// This function initializes the connection between the stream service and the zustand store.
// It should be called once in the application's lifecycle.
let isInitialized = false;
export const initializeTelemetryStore = () => {
    if (isInitialized) return () => {}; // Prevent multiple initializations
    isInitialized = true;

    const store = useTelemetryStore.getState();
    
    // Subscribe to data events from the main telemetry service
    const dataUnsubscribe = telemetryStream.subscribe((data) => {
        if (data && data.type) { // Basic validation
            store.addEvent(data as TelemetryEvent);
        }
    });

    // Subscribe to connection status changes from the main telemetry service
    const statusUnsubscribe = telemetryStream.onStatusChange((isConnected) => {
        store.setConnected(isConnected);
    });
    
    // Return a cleanup function that unsubscribes from both
    return () => {
        dataUnsubscribe();
        statusUnsubscribe();
        isInitialized = false; // Allow re-initialization if needed
    };
};
