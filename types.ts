
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

export interface Attachment {
  mimeType: string;
  data: string; // Base64
  name?: string;
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
  attachments?: Attachment[];
  groundingSources?: GroundingSource[];
  generatedImage?: string; // Base64
}

export enum ModelType {
  Pro = 'GEMINI_PRO',
  Flash = 'GEMINI_FLASH'
}

export type UserRole = 'VISITOR' | 'MEMBER' | 'CAPTAIN' | 'GENERAL_MANAGER';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  clearanceLevel: number;
  legalStatus: 'GREEN' | 'AMBER' | 'RED';
  loyalty?: {
    tier: 'ADMIRAL' | 'COMMANDER' | 'SAILOR';
    totalMiles: number;
    spendableMiles: number;
    nextTierProgress: number;
    milesToNextTier: number;
    memberSince: string;
    cardNumber: string;
  };
}

export interface RegistryEntry {
  id: string;
  timestamp: string;
  vessel: string;
  type: 'ARRIVAL' | 'DEPARTURE';
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  priority: number;
}

export interface Tender {
  id: string;
  name: string;
  callsign?: string;
  status: 'Idle' | 'Busy' | 'Maintenance';
  type: 'RIB' | 'Workboat' | 'Palamar Botu';
  assignment?: string;
  serviceCount?: number;
}

export interface VhfLog {
    id: string;
    timestamp: string;
    channel: string;
    speaker: 'CONTROL' | 'VESSEL';
    message: string;
}

export interface AisTarget {
    name: string;
    type: string;
    distance: string;
    squawk: string;
    status: string;
    speed: string;
    coordinates: {
        lat: number;
        lng: number;
    };
}

export interface VesselSystemsStatus {
  battery: { serviceBank: number, engineBank: number, status: string };
  tanks: { fuel: number, freshWater: number, blackWater: number };
  bilge: { forward: string, aft: string, pumpStatus: string };
  shorePower: { connected: boolean, voltage: number, amperage: number };
  comfort?: { // Ada Sea ONE IoT
    climate: { zone: string, setPoint: number, currentTemp: number, mode: string, fanSpeed: string };
    lighting: { salon: boolean, deck: boolean, underwater: boolean };
    security: { mode: string, camerasActive: boolean };
  }
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
  dwt: number;
  loa: number;
  beam: number;
  status: 'DOCKED' | 'AT_ANCHOR' | 'INBOUND' | 'UNDERWAY';
  location?: string;
  coordinates?: { lat: number, lng: number };
  voyage: { lastPort: string, nextPort: string, eta: string };
  paymentHistoryStatus?: 'REGULAR' | 'RECENTLY_LATE' | 'CHRONICALLY_LATE';
  adaSeaOneStatus?: 'ACTIVE' | 'INACTIVE';
  utilities?: {
      electricityKwh: number;
      waterM3: number;
      lastReading: string;
      status: 'ACTIVE' | 'DISCONNECTED';
  };
  outstandingDebt?: number;
  loyaltyScore?: number;
}

export interface WeatherForecast {
    temp: number;
    condition: 'Sunny' | 'Cloudy' | 'Rain' | 'Storm';
    windSpeed: number;
    windDir: 'N' | 'S' | 'E' | 'W' | 'NE' | 'NW' | 'SE' | 'SW';
}

export type NodeName = 
  | 'ada.stargate'
  | 'ada.marina'
  | 'ada.finance'
  | 'ada.legal'
  | 'ada.sea'
  | 'ada.vhf'
  | 'ada.technic'
  | 'ada.customer'
  | 'ada.security'
  | 'ada.passkit'
  | 'ada.executive'
  | 'ada.presenter'
  | 'ada.travel'
  | 'ada.congress'
  | 'ada.facility'
  | 'ada.energy'
  | 'ada.shield'
  | 'ada.hr'
  | 'ada.commercial'
  | 'ada.analytics'
  | 'ada.berth'
  | 'ada.reservations'
  | 'ada.federation'
  | 'ada.it'
  | 'ada.robotics';

export interface AgentTraceLog {
  id: string;
  timestamp: string;
  node: NodeName;
  step: 'ROUTING' | 'THINKING' | 'PLANNING' | 'TOOL_CALL' | 'TOOL_EXECUTION' | 'CODE_OUTPUT' | 'OUTPUT' | 'FINAL_ANSWER' | 'ERROR' | 'WARNING' | 'CRITICAL' | 'VOTING';
  content: string | any;
  isError?: boolean;
  persona?: 'ORCHESTRATOR' | 'EXPERT' | 'WORKER';
}

export interface AgentAction {
    id: string;
    kind: 'internal' | 'external';
    name: string;
    params: any;
}

export interface OrchestratorResponse {
  text: string;
  actions: AgentAction[];
  traces: AgentTraceLog[];
}

export interface MaintenanceLogEntry {
    timestamp: string;
    stage: 'SCHEDULED' | 'IN_PROGRESS' | 'WAITING_PARTS' | 'PARTS_ORDERED' | 'PARTS_ARRIVED' | 'COMPLETED' | 'CANCELLED';
    details: string;
}

export interface MaintenanceJob {
    id: string;
    vesselName: string;
    jobType: 'ENGINE_SERVICE' | 'HAUL_OUT' | 'ANTIFOULING' | 'GENERAL_REPAIR';
    status: 'SCHEDULED' | 'IN_PROGRESS' | 'WAITING_PARTS' | 'COMPLETED' | 'CANCELLED';
    scheduledDate: string;
    contractor: string;
    partsStatus: 'N/A' | 'ORDERED' | 'ARRIVED';
    notes: string;
    logs: MaintenanceLogEntry[];
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
    status: 'REGISTERED' | 'CHECKED_IN' | 'IN_TRANSIT' | 'CANCELLED';
    location: string;
}

export interface EnergyGridStatus {
    loadPercentage: number;
    gridStability: 'STABLE' | 'FLUCTUATING';
    activeConsumers: number;
    peakShavingActive: boolean;
    carbonFootprint: number;
}

export interface SecurityThreat {
    id: string;
    type: 'DRONE' | 'DIVER' | 'SPEEDBOAT';
    coordinates: { lat: number, lng: number };
    altitudeDepth: number;
    speed: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    detectedBy: 'RADAR' | 'SONAR' | 'RF_SCANNER' | 'CCTV_YOLO';
    timestamp: string;
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

// NEW: Presentation Mode State
export interface PresentationState {
  isActive: boolean;
  slide: 'intro' | 'scribe' | 'analysis' | 'observer';
  transcript: string; // The live speech-to-text buffer
  language?: 'en' | 'tr';
  analysisResults: {
    minutes: string;
    proposal: string;
  } | null;
}

// Data structure for the entire marina master data
export interface MasterDataStructure {
  identity: any;
  assets: {
    tenders: Tender[];
    charter_fleet?: any[];
  };
  campus_stats?: any;
  commercial_tenants?: any;
  technical_facilities?: any;
  hr_management?: any;
  analytics_data?: any;
  strategic_partners?: any;
  legal_framework?: any;
  event_calendar?: any;
  concierge_services?: any;
  facility_management?: any;
  // FIX: Add services property to support tenant-specific amenities like restaurants.
  services?: {
    amenities?: {
      restaurants?: string[];
    };
  };
  // FIX: Add properties to support vessel-specific tenant data like for 'phisedelia'.
  vessel_id?: string;
  type?: string;
  flag?: string;
  loa?: number;
  
  // Added properties for D-Marin global structure
  loyalty_program?: any;
  marina_portfolio?: any;
  digital_services?: any;
}

export interface TenantConfig {
  id: string;
  name: string;
  fullName: string;
  network: string;
  node_address: string;
  status: 'ONLINE' | 'OFFLINE';
  api_endpoint?: string;
  region?: string;
  tier?: 'PRESTIGE_HUB' | 'STANDARD';
  mission: string;
  contextSources: string[];
  rules: Record<string, any>;
  doctrine: string;
  masterData: Partial<MasterDataStructure>;
}