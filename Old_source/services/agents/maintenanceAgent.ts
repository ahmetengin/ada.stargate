
// services/agents/maintenanceAgent.ts
// DEPRECATED: Functionality moved to services/agents/technicAgent.ts

import { MaintenanceJob } from '../../types';

export const maintenanceHandlers = {};

export const maintenanceExpert = {
    getActiveJobs: (): MaintenanceJob[] => [],
    scheduleService: async (): Promise<any> => ({ success: false, message: "Deprecated agent. Use ada.technic." }),
    checkStatus: async (): Promise<string> => "Deprecated agent. Use ada.technic.",
};
