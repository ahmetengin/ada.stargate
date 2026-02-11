
// services/core/telemetryStore.ts
import { create } from 'zustand';
import { TelemetryEvent } from '../../types';
import { telemetryStream } from './telemetryStream';

interface TelemetryState {
    events: TelemetryEvent[];
    isConnected: boolean;
    activeAlerts: number;
    addEvent: (event: TelemetryEvent) => void;
    setConnected: (status: boolean) => void;
}

export const useTelemetryStore = create<TelemetryState>((set) => ({
    events: [],
    isConnected: false,
    activeAlerts: 0,
    addEvent: (event) => set((state) => {
        const newEvents = [event, ...state.events].slice(0, 100);
        return { 
            events: newEvents,
            activeAlerts: newEvents.filter(e => e.severity === 'critical' || e.severity === 'error').length
        };
    }),
    setConnected: (status) => set({ isConnected: status }),
}));

let isInitialized = false;
export const initializeTelemetryStore = () => {
    if (isInitialized) return () => {};
    isInitialized = true;
    const store = useTelemetryStore.getState();
    const dataUnsub = telemetryStream.subscribe((data) => store.addEvent(data));
    const statusUnsub = telemetryStream.onStatusChange((status) => store.setConnected(status));
    return () => {
        dataUnsub();
        statusUnsub();
        isInitialized = false;
    };
};
