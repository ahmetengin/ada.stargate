
// types.ts

export enum MessageRole {
  User = 'user',
  Model = 'model',
  System = 'system'
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
  attachments?: Attachment[];
  timestamp: number;
  isThinking?: boolean; // UI state for ongoing generation
  groundingSources?: GroundingSource[]; // URLs from search
  generatedImage?: string; // Base64 or URL for generated image
}

export enum ModelType {
  Flash = 'gemini-2.5-flash',
  Pro = 'gemini-3-pro-preview',
}

export interface AppState {
  messages: Message[];
  isLoading: boolean;
  selectedModel: ModelType;
  useSearch: boolean;
  useThinking: boolean;
}

export enum LiveConnectionState {
  Disconnected = 'disconnected',
  Connecting = 'connecting',
  Connected = 'connected',
  Error = 'error'
}

export interface RegistryEntry {
  id: string;
  timestamp: string;
  vessel: string;
  action: 'CHECK-IN' | 'CHECK-OUT';
  location: string;
  status: 'AUTHORIZED' | 'PENDING' | 'DENIED';
}

export interface VhfLog {
    id: string;
    timestamp: string;
    channel: string;
    speaker: 'VESSEL' | 'CONTROL';
    message: string;
}

export interface Tender {
  id: string;
  name: string;
  callsign?: string; // Added for display
  status: 'Idle' | 'Busy' | 'Maintenance';
  assignment?: string;
  serviceCount?: number; 
  type?: string;
}

export interface AisTarget {
    name: string;
    type: string;
    distance: string;
    squawk: string;
    status: string;
    coordinates: { lat: number; lng: number; };
    speed: string;
    course?: number;
}

export type UserRole = 'VISITOR' | 'MEMBER' | 'CAPTAIN' | 'GENERAL_MANAGER';

// --- LOYALTY PROGRAM TYPES ---
export type LoyaltyTier = 'MARINER' | 'COMMANDER' | 'ADMIRAL'; // Classic, Elite, Elite Plus

export interface LoyaltyStatus {
    tier: LoyaltyTier;
    totalMiles: number; // Lifetime accumulation
    spendableMiles: number; // Current balance
    nextTierProgress: number; // Percentage 0-100
    milesToNextTier: number;
    memberSince: string;
    cardNumber: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  clearanceLevel: number;
  legalStatus: 'GREEN' | 'RED';
  contractId?: string;
  loyalty?: LoyaltyStatus; // Linked Loyalty Program
}

// --- NEW: SCORING TYPES ---
export interface TrustScoreBreakdown {
    financial: number;   // 0-100 (Payment habits)
    operational: number; // 0-100 (Safety compliance)
    commercial: number;  // 0-100 (Spending power)
    social: number;      // 0-100 (Behavior/Complaints)
}

export interface CustomerRiskProfile {
    totalScore: number; // 0-1000 (Base 500)
    segment: 'WHALE' | 'VIP' | 'STANDARD' | 'RISKY' | 'BLACKLISTED';
    breakdown: TrustScoreBreakdown;
    lastAssessmentDate: string;
    flags: string[]; // e.g. ["Late Payer", "Speeding Violation"]
}

// --- NEW: ROBOTICS & HULL SCAN TYPES ---
export interface HullScanReport {
    date: string;
    status: 'CLEAN' | 'FOULING_MILD' | 'FOULING_SEVERE' | 'DAMAGE_DETECTED';
    anodesStatus: number; // 0-100%
    propellerStatus: 'CLEAR' | 'ENTANGLEMENT';
    summary: string;
    imageUrl?: string; // URL to scan image
}

export interface RoboticAsset {
    id: string;
    name: string;
    type: 'UAV_DRONE' | 'ROV_SUBSEA' | 'UGV_CART';
    status: 'IDLE' | 'ON_MISSION' | 'CHARGING' | 'MAINTENANCE';
    batteryLevel: number;
    currentMission?: string;
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
  status: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  voyage?: { lastPort: string; nextPort: string; eta: string };
  paymentHistoryStatus?: 'REGULAR' | 'RECENTLY_LATE';
  adaSeaOneStatus?: 'ACTIVE' | 'INACTIVE';
  utilities?: { electricityKwh: number; waterM3: number; lastReading: string; status: 'ACTIVE' | 'DISCONNECTED' };
  outstandingDebt?: number;
  loyaltyScore?: number;
  // Linked Risk Profile
  riskProfile?: CustomerRiskProfile;
  // New: Hull Scan
  lastHullScan?: HullScanReport;
}

export type NodeName = string | 'ada.stargate'; 

export interface AgentTraceLog {
  id: string;
  timestamp: string;
  node: NodeName;
  step: 'THINKING' | 'TOOL_EXECUTION' | 'TOOL_CALL' | 'CODE_OUTPUT' | 'PLANNING' | 'ROUTING' | 'FINAL_ANSWER' | 'OUTPUT' | 'VOTING' | 'ERROR' | 'WARNING';
  content: any;
  persona?: 'ORCHESTRATOR' | 'EXPERT' | 'WORKER';
  type?: string; 
  source?: string;
  message?: string;
  isError?: boolean;
}

// --- CONCIERGE TYPES ---
export interface MarketItem {
    id: string;
    name: string;
    category: 'PROVISIONS' | 'BEVERAGE' | 'CLEANING' | 'BAKERY';
    price: number;
    unit: string;
    imageIcon?: string;
}

export interface CateringMenu {
    id: string;
    restaurant: string;
    itemName: string;
    description: string;
    price: number;
    prepTime: number; // mins
}

export interface ServiceRequest {
    id: string;
    type: 'HOUSEKEEPING' | 'LAUNDRY' | 'FLORIST';
    details: string;
    status: 'PENDING' | 'DISPATCHED' | 'COMPLETED';
    requestedTime: string;
}

// --- UNIVERSAL OS CONFIG TYPES ---

export interface CommercialTenant {
  name: string;
  type: string;
  location: string;
  status?: 'Active' | 'Pending';
}

export interface TechnicalFacilitySpecs {
  travel_lift_major: string;
  travel_lift_minor: string;
  hardstanding_area: string;
  hangars: string;
  services: string[];
}

export interface CampusStats {
  total_area: string;
  sea_capacity: number;
  land_capacity: number;
}

export interface MasterDataStructure {
  identity: any;
  assets: any;
  commercial_tenants: {
    count: number;
    categories: string[];
    key_tenants: CommercialTenant[];
    lease_model: string;
    common_area_charge_formula: string;
  };
  technical_facilities: TechnicalFacilitySpecs;
  campus_stats: CampusStats;
  loyalty_program?: { // Added logic for loyalty program rules
      program_name?: string;
      earning_rates: Record<string, number>;
      redemption_catalog: Array<{ item: string, cost: number }>;
      tiers: Record<string, number>;
  };
  robotics_fleet?: RoboticAsset[]; // New Robotics Fleet
  concierge_services?: { // NEW
      market_inventory: MarketItem[];
      catering_menus: CateringMenu[];
      housekeeping_services: { type: string, rate: number }[];
  };
  [key: string]: any;
}

export interface TenantConfig {
  id: string;
  name: string;
  fullName: string;
  network: string; // e.g. 'wim.ada.network'
  node_address: string;
  status: 'ONLINE' | 'OFFLINE';
  api_endpoint?: string;
  region?: string;
  tier?: string;
  mission: string;
  contextSources: string[];
  rules: Record<string, any>;
  doctrine: string;
  masterData: Partial<MasterDataStructure>; // Dynamic bag for specific tenant data
}

export interface FederatedBerthAvailability {
  marinaId: string;
  date: string;
  totalBerths: number;
  availableBerths: number;
  occupancyRate: number;
  message: string;
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

export interface GuestProfile {
  id: string;
  fullName: string;
  nationality: string;
  dob: string;
  vesselName: string;
}

export interface VesselSystemsStatus {
  battery: {
    serviceBank: number;
    engineBank: number;
    status: string;
  };
  tanks: {
    fuel: number;
    freshWater: number;
    blackWater: number;
  };
  bilge: {
    forward: string;
    aft: string;
    pumpStatus: string;
  };
  shorePower: {
    connected: boolean;
    voltage: number;
    amperage: number;
  };
  comfort: {
    climate: {
      zone: string;
      setPoint: number;
      currentTemp: number;
      mode: string;
      fanSpeed: string;
    };
    lighting: {
      salon: boolean;
      deck: boolean;
      underwater: boolean;
    };
    security: {
      mode: string;
      camerasActive: boolean;
    };
  };
}

export interface WeatherForecast {
  day: string;
  temp: number;
  condition: string;
  windSpeed: number;
  windDir: string;
}

export interface CongressEvent {
  id: string;
  name: string;
  dates: { start: string; end: string };
  venues: string[];
  status: string;
  delegateCount: number;
}

export interface Delegate {
  id: string;
  name: string;
  company: string;
  status: 'CHECKED_IN' | 'IN_TRANSIT' | 'REGISTERED';
  location: string;
}

export interface MaintenanceLogEntry {
  timestamp: string;
  stage: string;
  details: string;
}

export interface MaintenanceJob {
  id: string;
  vesselName: string;
  jobType: 'HAUL_OUT' | 'ENGINE_SERVICE' | 'GENERAL_REPAIR';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'WAITING_PARTS' | 'COMPLETED';
  scheduledDate: string;
  contractor: string;
  partsStatus: 'N/A' | 'ORDERED' | 'ARRIVED';
  notes: string;
  logs: MaintenanceLogEntry[];
}

export interface TravelItinerary {
  id: string;
  passengerName: string;
  tripName: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  totalCost: number;
  flights: any[];
  hotels: any[];
  transfers: any[];
}

// --- NEW: ENERGY & SECURITY TYPES ---
export interface EnergyGridStatus {
    loadPercentage: number; // 0-100
    gridStability: 'STABLE' | 'FLUCTUATING' | 'CRITICAL';
    activeConsumers: number;
    peakShavingActive: boolean;
    carbonFootprint: number; // kg CO2
}

export interface SecurityThreat {
    id: string;
    type: 'DRONE' | 'DIVER' | 'UNAUTHORIZED_VESSEL';
    coordinates: { lat: number; lng: number };
    altitudeDepth: number; // meters (negative for diver)
    speed: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    detectedBy: 'RADAR' | 'SONAR' | 'RF_SCANNER';
    timestamp: string;
}
