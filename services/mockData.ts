
import { UserProfile } from '../types';

export const MOCK_USER_DATABASE: Record<string, UserProfile> = {
  'VISITOR': { id: 'usr_visitor', name: 'Ziyaretçi', role: 'VISITOR', clearanceLevel: 0, legalStatus: 'GREEN' },
  'MEMBER': { id: 'usr_member_01', name: 'Caner Erkin', role: 'MEMBER', clearanceLevel: 1, legalStatus: 'GREEN', loyalty: { tier: 'COMMANDER', totalMiles: 32500, spendableMiles: 12400, nextTierProgress: 65, milesToNextTier: 17500, memberSince: '2023', cardNumber: 'TK-19238123'}},
  'CAPTAIN': { id: 'usr_cpt_01', name: 'Kpt. Barbaros', role: 'CAPTAIN', clearanceLevel: 3, legalStatus: 'GREEN', loyalty: { tier: 'ADMIRAL', totalMiles: 154000, spendableMiles: 45000, nextTierProgress: 100, milesToNextTier: 0, memberSince: '2019', cardNumber: 'TK-88123991'}},
  'GENERAL_MANAGER': { id: 'usr_gm_01', name: 'Ahmet Engin', role: 'GENERAL_MANAGER', clearanceLevel: 5, legalStatus: 'GREEN' }
};
