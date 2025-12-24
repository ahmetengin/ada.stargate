// types.ts

export enum MessageRole {
  User = 'user',
  Model = 'model',
  System = 'system'
}

export enum LiveConnectionState {
  Disconnected = 'disconnected',
  Connecting = 'connecting',
  Connected = 'connected',
  Error = 'error'
}

export type ThemeMode = 'light' | 'dark' | 'auto';
export type Severity = 'critical' | 'error' | 'warn' | 'info' | 'debug';

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface Attachment {
  name?: string;
  mimeType: string;
  data: string; // base64
}

export interface TelemetryEvent {
    ts: string;
    type: string;
    severity: Severity;
    source: string;
    marina_id: string;
    payload: Record<string, any>;
    berth_id?: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: number;
  generatedCode?: string;
  executionResult?: string;
  groundingSources?: GroundingSource[];
  generatedImage?: string; // base64 image
  attachments?: Attachment[];
}

export type UserRole = 'VISITOR' | 'MEMBER' | 'CAPTAIN' | 'GENERAL_MANAGER';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  clearanceLevel: number;
  legalStatus: 'GREEN' | 'AMBER' | 'RED';
  loyalty?: any;
  loyaltyScore?: number;
}

// --- CoALA (Cognitive Architectures for Language Agents) Types ---
export type MemoryModule = 'working' | 'episodic' | 'semantic' | 'procedural';

export interface AgentTraceLog {
  id: string;
  timestamp: string;
  node: string;
  module?: MemoryModule; // CoALA Module alignment
  step: 'OBSERVE' | 'PLAN' | 'ACT' | 'REFLECT' | 'ROUTING' | 'THINKING' | 'CODE_OUTPUT' | 'ERROR' | 'ACE_UPDATE' | 'TOOL_EXECUTION' | 'OUTPUT' | 'PLANNING' | 'TOOL_CALL' | 'FINAL_ANSWER' | 'VOTING' | 'WARNING' | 'CRITICAL' | 'ACE_REFLECTION' | 'ACE_UPDATE';
  content: string | any;
  persona?: 'ORCHESTRATOR' | 'EXPERT' | 'WORKER';
  code?: string;
  result?: string;
  isError?: boolean;
}

export interface PlaybookStrategy {
    id: string;
    domain: 'MARINA' | 'FINANCE' | 'LEGAL' | 'STARGATE';
    title: string;
    content: string;
    successRate: number;
    usageCount: number;
}

export interface TenantConfig {
  id: string;
  name: string;
  fullName: string;
  network: string;
  doctrine: string;
  masterData: any;
  node_address: string;
  status?: string;
  region?: string;
  tier?: string;
  mission?: string;
  contextSources?: string[];
  rules?: Record<string, any>;
  api_endpoint?: string;
}

export enum ModelType {
  Pro = 'gemini-3-pro-preview',
  Flash = 'gemini-3-flash-preview'
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

export interface Tender {
  id: string;
  name: string;
  status: string;
  assignment?: string;
  type?: string;
  serviceCount?: number;
  sensors?: string[];
  callsign?: string;
}

export interface AisTarget {
  name: string;
  type: string;
  distance: string;
  coordinates: { lat: number; lng: number };
  squawk?: string;
  status?: string;
  speed?: string;
  source?: string;
}

export interface PresentationState {
  isActive: boolean;
  slide: 'intro' | 'scribe' | 'analysis';
  transcript: string;
  analysisResults: any;
}

export interface MasterDataStructure {
  identity: any;
  assets?: {
    tenders: Tender[];
    charter_fleet: any[];
  };
  marina_portfolio?: Record<string, any[]>;
  loyalty_program?: any;
  ocean_guardians?: any;
  digital_services?: any;
  commercial_tenants?: any;
  technical_facilities?: any;
  hr_management?: any;
  analytics_data?: any;
  services?: any;
  legal_framework?: any;
  event_calendar?: any[];
  campus_stats?: any;
  concierge_services?: any;
  facility_management?: any;
  strategic_partners?: any;
}

export interface AgentAction {
  id: string;
  kind: 'internal' | 'external';
  name: string;
  params: any;
}

// Added EnergyGridStatus interface to resolve import error in facilityAgent.ts
export interface EnergyGridStatus {
  loadPercentage: number;
  gridStability: 'STABLE' | 'FLUCTUATING' | 'CRITICAL';
  activeConsumers: number;
  peakShavingActive: boolean;
  carbonFootprint: number;
}

// Expanded NodeName union type to include missing node identifiers used in agent services
export type NodeName = 'ada.marina' | 'ada.sea' | 'ada.technic' | 'ada.energy' | 'ada.robotics' | 'ada.finance' | 'ada.commercial' | 'ada.customer' | 'ada.legal' | 'ada.security' | 'ada.shield' | 'ada.stargate' | 'ada.orchestrator' | 'ada.federation' | 'ada.hr' | 'ada.it' | 'ada.executive' | 'ada.reservations' | 'ada.analytics' | 'ada.concierge' | 'ada.congress' | 'ada.berth' | 'ada.travel' | 'ada.passkit' | 'ada.facility' | 'ada.yield';

export interface TravelItinerary {
  id: string;
  passengerName: string;
  tripName: string;
  status: 'ACTIVE' | 'CANCELLED' | 'COMPLETED';
  totalCost: number;
  flights: any[];
  hotels: any[];
  transfers: any[];
}

export interface VesselIntelligenceProfile {
  name: string;
  imo: string;
  type: string;
  flag: string;
  ownerName?: string;
  ownerId?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  dwt?: number;
  loa: number;
  beam: number;
  status?: string;
  location?: string;
  relationship?: 'VISITOR' | 'CONTRACT_HOLDER' | 'RESERVATION';
  coordinates?: { lat: number; lng: number };
  voyage?: { lastPort: string, nextPort: string, eta: string };
  paymentHistoryStatus?: string;
  adaSeaOneStatus?: 'ACTIVE' | 'INACTIVE';
  utilities?: { electricityKwh: number, waterM3: number, lastReading: string, status: string };
  loyaltyScore?: number;
  outstandingDebt?: number;
}

export interface VesselSystemsStatus {
  battery: { serviceBank: number; engineBank: number; status: string };
  tanks: { fuel: number; freshWater: number; blackWater: number };
  bilge: { forward: string; aft: string; pumpStatus: string };
  shorePower: { connected: boolean; voltage: number; amperage: number };
  comfort?: {
    climate: { zone: string; setPoint: number; currentTemp: number; mode: string; fanSpeed: string };
    lighting: { salon: boolean; deck: boolean; underwater: boolean };
    security: { mode: string; camerasActive: boolean };
  }
}

export interface SecurityThreat {
  id: string;
  type: 'DRONE' | 'DIVER' | 'VESSEL' | 'PERSON';
  coordinates: { lat: number, lng: number };
  altitudeDepth: number;
  speed: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  detectedBy: string;
  timestamp: string;
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

export interface CustomerRiskProfile {
  totalScore: number;
  segment: 'WHALE' | 'VIP' | 'STANDARD' | 'RISKY' | 'BLACKLISTED';
  breakdown: {
      financial: number;
      operational: number;
      commercial: number;
      social: number;
  };
  flags: string[];
  lastAssessmentDate: string;
}

export interface GuestProfile {
  id: string;
  fullName: string;
  nationality: string;
  dob: string;
  vesselName: string;
}

export interface FederatedBerthAvailability {
  marinaId: string;
  date: string;
  totalBerths: number;
  availableBerths: number;
  occupancyRate: number;
  message: string;
}

export interface MaintenanceLogEntry {
  timestamp: string;
  stage: 'SCHEDULED' | 'PARTS_ORDERED' | 'PARTS_ARRIVED' | 'IN_PROGRESS' | 'COMPLETED';
  details: string;
}

export interface MaintenanceJob {
  id: string;
  vesselName: string;
  jobType: 'HAUL_OUT' | 'ENGINE_SERVICE' | 'GENERAL_REPAIR' | 'ELECTRICAL' | 'HULL_CLEANING';
  status: 'SCHEDULED' | 'WAITING_PARTS' | 'IN_PROGRESS' | 'COMPLETED';
  scheduledDate: string;
  contractor: string;
  partsStatus: 'N/A' | 'ORDERED' | 'ARRIVED';
  notes: string;
  logs: MaintenanceLogEntry[];
}

export interface VhfLog {
  id: string;
  timestamp: string;
  channel: string;
  from: string;
  message: string;
}
