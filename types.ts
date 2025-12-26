
// types.ts

// --- CORE ENUMS (Keep at top to avoid SyntaxError/Hoist issues) ---
export enum ModelType {
  Pro = 'gemini-3-pro-preview',
  Flash = 'gemini-3-flash-preview'
}

export enum MessageRole {
  User = 'user',
  Model = 'model',
  System = 'system',
  Episode = 'episode'
}

export enum LiveConnectionState {
  Disconnected = 'disconnected',
  Connecting = 'connecting',
  Connected = 'connected',
  Error = 'error'
}

export type EpisodeId = 'EPISODE_A' | 'EPISODE_B' | 'EPISODE_C' | 'EPISODE_G' | 'EPISODE_H' | 'NONE';

// --- INTERFACES ---
export interface Attachment {
  name: string;
  mimeType: string;
  data: string; // base64
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: number;
  episodeId?: EpisodeId;
  nodePath?: string;
  generatedCode?: string;
  executionResult?: string;
  attachments?: Attachment[];
  generatedImage?: string;
}

export type ThemeMode = 'light' | 'dark' | 'auto';
export type Severity = 'critical' | 'error' | 'warn' | 'info' | 'debug';

export interface TelemetryEvent {
    ts: string;
    type: string;
    severity: Severity;
    source: string;
    marina_id: string;
    payload: Record<string, any>;
    berth_id?: string;
}

export type UserRole = 'VISITOR' | 'MEMBER' | 'CAPTAIN' | 'GENERAL_MANAGER';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  clearanceLevel: number;
  legalStatus: 'GREEN' | 'AMBER' | 'RED';
  loyalty?: any;
}

export type MemoryModule = 'working' | 'episodic' | 'semantic' | 'procedural';

export interface AgentTraceLog {
  id: string;
  timestamp: string;
  node: string;
  module?: MemoryModule;
  step: 'OBSERVE' | 'PLAN' | 'ACT' | 'REFLECT' | 'ROUTING' | 'THINKING' | 'CODE_OUTPUT' | 'ERROR' | 'ACE_UPDATE' | 'TOOL_EXECUTION' | 'OUTPUT' | 'PLANNING' | 'TOOL_CALL' | 'FINAL_ANSWER' | 'VOTING' | 'WARNING' | 'CRITICAL' | 'ACE_REFLECTION' | 'ACE_UPDATE';
  content: string | any;
  persona?: 'ORCHESTRATOR' | 'EXPERT' | 'WORKER';
  isError?: boolean;
  code?: string;
  result?: string;
}

export interface PlaybookStrategy {
    id: string;
    domain: 'MARINA' | 'FINANCE' | 'LEGAL' | 'STARGATE';
    title: string;
    content: string;
    successRate: number;
    usageCount: number;
}

export interface Tender {
  id: string;
  name: string;
  status: string;
  type?: string;
  serviceCount?: number;
  sensors?: string[];
  assignment?: string;
  callsign?: string;
}

export interface AgentAction {
  id: string;
  kind: 'internal' | 'external';
  name: string;
  params: any;
}

export interface TravelItinerary {
  id: string;
  passengerName: string;
  tripName: string;
  status: string;
  totalCost: number;
  flights: any[];
  hotels: any[];
  transfers: any[];
}

// NEW: Scoring History Item
export interface ATSHistoryItem {
    id: string;
    date: string;
    action: string; // e.g., "Late Payment", "High Spend", "Speeding"
    delta: number; // e.g., -50, +20
    category: 'FINANCE' | 'OPS' | 'BEHAVIOR' | 'LOYALTY';
    description: string;
}

export interface CustomerRiskProfile {
  totalScore: number; // 0 - 1000
  segment: 'WHALE' | 'PLATINUM' | 'STANDARD' | 'RISKY' | 'BLACKLISTED';
  breakdown: {
    financial: number; // 0-400
    operational: number; // 0-300
    behavioral: number; // 0-200
    loyalty: number; // 0-100
  };
  flags: string[];
  history: ATSHistoryItem[]; // Full audit trail
  lastAssessmentDate: string;
}

export interface MaintenanceLogEntry {
  timestamp: string;
  stage: 'SCHEDULED' | 'PARTS_ORDERED' | 'PARTS_ARRIVED' | 'IN_PROGRESS' | 'COMPLETED';
  details: string;
}

export interface MaintenanceJob {
  id: string;
  vesselName: string;
  jobType: 'HAUL_OUT' | 'ENGINE_SERVICE' | 'GENERAL_REPAIR';
  status: 'SCHEDULED' | 'WAITING_PARTS' | 'IN_PROGRESS' | 'COMPLETED';
  scheduledDate: string;
  contractor: string;
  partsStatus: 'N/A' | 'ORDERED' | 'ARRIVED';
  notes: string;
  logs: MaintenanceLogEntry[];
}

export interface SecurityThreat {
  id: string;
  type: 'DRONE' | 'DIVER' | 'UNAUTHORIZED_VESSEL';
  coordinates: { lat: number; lng: number };
  altitudeDepth: number;
  speed: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  detectedBy: string;
  timestamp: string;
}

// NEW: Real-time Alert Structure
export interface SecurityAlert {
    id: string;
    timestamp: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    type: 'UNAUTHORIZED_ENTRY' | 'SPEEDING' | 'DRONE_DETECTED' | 'GEOFENCE_BREACH';
    location: string;
    targetId?: string; // Vessel name or Object ID
    message: string;
    status: 'ACTIVE' | 'RESOLVED' | 'INVESTIGATING';
}

export interface CongressEvent {
  id: string;
  name: string;
  dates: { start: string, end: string };
  venues: string[];
  status: 'LIVE' | 'UPCOMING' | 'COMPLETED';
  delegateCount: number;
}

export interface Delegate {
  id: string;
  name: string;
  company: string;
  status: 'CHECKED_IN' | 'IN_TRANSIT' | 'REGISTERED';
  location: string;
}

export interface FederatedBerthAvailability {
  marinaId: string;
  date: string;
  totalBerths: number;
  availableBerths: number;
  occupancyRate: number;
  message: string;
}

export interface GuestProfile {
  id: string;
  fullName: string;
  nationality: string;
  dob: string;
  vesselName: string;
}

export interface VhfLog {
  timestamp: string;
  channel: string;
  message: string;
  sender: string;
}

export interface MasterDataStructure {
  identity: any;
  assets?: {
    tenders: Tender[];
    charter_fleet?: any[];
  };
  event_calendar?: any[];
  commercial_tenants?: any;
  campus_stats?: any;
  technical_facilities?: any;
  hr_management?: any;
  analytics_data?: any;
  strategic_partners?: {
    cross_border_partners: any[];
  };
  legal_framework?: any;
  concierge_services?: any;
  facility_management?: any;
  services?: any;
  marina_portfolio?: any;
  loyalty_program?: any;
  ocean_guardians?: any;
  digital_services?: any;
  protocol_config?: {
      welcome_hail?: {
          channel: string;
          template: string;
          trigger_distance_min: number;
          trigger_distance_max: number;
      };
  };
}

export interface TenantConfig {
  id: string;
  name: string;
  fullName: string;
  network: string;
  doctrine: string;
  masterData: MasterDataStructure;
  node_address: string;
  status?: string;
  region?: string;
  api_endpoint?: string;
  tier?: string;
  mission?: string;
  contextSources?: string[];
  rules?: Record<string, any>;
}

export interface WeatherForecast {
  temp: number;
  condition: string;
  windSpeed: number;
  windDir: string;
}

export interface RegistryEntry {
  id: string;
  vesselName: string;
  status: string;
  arrivalTime: string;
}

export interface AisTarget {
  name: string;
  type: string;
  distance: string;
  coordinates: { lat: number; lng: number };
}

export interface PresentationState {
  isActive: boolean;
  slide: 'intro' | 'scribe' | 'analysis';
  transcript: string;
  analysisResults: any;
}

export interface EnergyGridStatus {
  loadPercentage: number;
  gridStability: 'STABLE' | 'FLUCTUATING' | 'CRITICAL';
  activeConsumers?: number;
  peakShavingActive?: boolean;
  carbonFootprint?: number;
}

export type NodeName = 'ada.marina' | 'ada.sea' | 'ada.technic' | 'ada.energy' | 'ada.robotics' | 'ada.finance' | 'ada.commercial' | 'ada.customer' | 'ada.legal' | 'ada.security' | 'ada.shield' | 'ada.stargate' | 'ada.federation' | 'ada.hr' | 'ada.it' | 'ada.executive' | 'ada.reservations' | 'ada.analytics' | 'ada.concierge' | 'ada.congress' | 'ada.berth' | 'ada.travel' | 'ada.passkit' | 'ada.facility' | 'ada.yield';

export interface VesselIntelligenceProfile {
  name: string;
  imo: string;
  type: string;
  flag: string;
  loa: number;
  beam: number;
  ownerName?: string;
  status?: string;
  outstandingDebt?: number;
  relationship?: 'VISITOR' | 'CONTRACT_HOLDER' | 'RESERVATION';
  ownerId?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  dwt?: number;
  location?: string;
  coordinates?: { lat: number; lng: number };
  voyage?: any;
  paymentHistoryStatus?: string;
  adaSeaOneStatus?: string;
  utilities?: any;
  loyaltyScore?: number;
  riskProfile?: CustomerRiskProfile; // Linked profile
}

export interface VesselSystemsStatus {
  battery: { serviceBank: number; status: string; engineBank?: number };
  tanks: { fuel: number; freshWater: number; blackWater?: number };
  shorePower: { connected: boolean; voltage: number; amperage: number };
  comfort?: { climate: { currentTemp: number; zone?: string; mode?: string } };
  bilge?: any;
}

export interface NavtexMessage {
    id: string;
    stationCode: string; // 'I' for Izmir, 'L' for Limnos
    messageType: string; // 'A' = Navigational Warning
    content: string;
    coordinates?: { lat: number, lng: number };
    status: 'ACTIVE' | 'CANCELLED';
    timestamp: string;
}
