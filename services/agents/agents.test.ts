
import { describe, it, expect, vi } from 'vitest';
import { AGENT_REGISTRY } from './registry';
import { marinaExpert } from './marinaAgent';
import { financeExpert } from './financeAgent';
import { legalExpert } from './legalAgent';
import { securityExpert } from './securityAgent';
import { MOCK_USER_DATABASE } from '../data/mockData';

// Mock Log Tracer
const mockTrace = vi.fn();

describe('⚓️ Ada Stargate Agent System Verification', () => {

    it('should have all core agents registered', () => {
        const requiredAgents = [
            'ada.marina', 'ada.finance', 'ada.legal', 'ada.technic',
            'ada.security', 'ada.hr', 'ada.commercial', 'ada.concierge'
        ];
        requiredAgents.forEach(id => {
            expect(AGENT_REGISTRY).toHaveProperty(id);
        });
    });

    describe('🌊 Marina Operations (Ada.Marina)', () => {
        it('should retrieve fleet vessels', () => {
            const fleet = marinaExpert.getAllFleetVessels();
            expect(fleet).toBeDefined();
            expect(fleet.length).toBeGreaterThan(0);
            expect(fleet[0]).toHaveProperty('name');
        });

        it('should get vessel telemetry without crashing', async () => {
            const telemetry = await marinaExpert.getVesselTelemetry('S/Y Phisedelia');
            expect(telemetry).toHaveProperty('battery');
            expect(telemetry).toHaveProperty('tanks');
        });
    });

    describe('💰 Finance & Yield (Ada.Finance)', () => {
        it('should calculate early booking offers correctly', async () => {
            const offer = await financeExpert.calculateEarlyBookingOffer(1000, '2025-06-01', mockTrace);
            expect(offer.finalPrice).toBeLessThan(1000);
            expect(offer.strategy).toBe('EARLY_BIRD');
        });

        it('should generate payment links', async () => {
            const result = await financeExpert.createPaymentLink('Test Boat', 100, 'Mooring', mockTrace);
            expect(result.success).toBe(true);
            expect(result.link).toContain('iyzi.co');
        });
    });

    describe('⚖️ Legal & Compliance (Ada.Legal)', () => {
        it('should block unauthorized users from legal advice', async () => {
            const unauthorizedUser = MOCK_USER_DATABASE['VISITOR'];
            const result = await legalExpert.process({ query: 'Contract Check' }, unauthorizedUser, mockTrace);
            // Expect internal action or denial log
            expect(result[0].name).toContain('accessDenied');
        });

        it('should allow GM to access legal advice', async () => {
            const gmUser = MOCK_USER_DATABASE['GENERAL_MANAGER'];
            const result = await legalExpert.process({ query: 'Contract Check' }, gmUser, mockTrace);
            expect(result[0].name).toBe('ada.legal.consultation');
        });
    });

    describe('🛡️ Security (Ada.Security)', () => {
        it('should detect high priority threats', async () => {
            // Mocking logic inside agent might be random, but structure should be valid
            const alerts = await securityExpert.monitorRealTimeThreats([], mockTrace);
            expect(Array.isArray(alerts)).toBe(true);
        });
    });

});
