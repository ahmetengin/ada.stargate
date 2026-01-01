
// services/data/mockData.ts
import { UserProfile } from '../../types';

export const MOCK_USER_DATABASE: Record<string, UserProfile> = {
  'VISITOR': { id: 'usr_visitor', name: 'Ziyaretçi', role: 'VISITOR', clearanceLevel: 0, legalStatus: 'GREEN' },
  'MEMBER': { id: 'usr_member_01', name: 'Caner Erkin', role: 'MEMBER', clearanceLevel: 1, legalStatus: 'GREEN' },
  'CAPTAIN': { id: 'usr_cpt_01', name: 'Kpt. Barbaros', role: 'CAPTAIN', clearanceLevel: 3, legalStatus: 'GREEN' },
  'GENERAL_MANAGER': { id: 'usr_gm_01', name: 'Ahmet Engin', role: 'GENERAL_MANAGER', clearanceLevel: 5, legalStatus: 'GREEN' }
};
