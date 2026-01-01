
// services/utils/utils.ts

export function maskFullName(fullName: string): string {
    if (!fullName || fullName.trim().length < 3) return "N/A";
    const parts = fullName.trim().toUpperCase().split(' ');
    const maskedParts = parts.map(part => {
        if (part.length <= 2) return part;
        return `${part[0]}${'*'.repeat(part.length - 2)}${part[part.length - 1]}`;
    });
    return maskedParts.join(' ');
}

export function maskIdNumber(idNumber: string): string {
    if (!idNumber || idNumber.length < 4) return "ID MASKED";
    return `${idNumber.substring(0, 3)}${'*'.repeat(idNumber.length - 5)}${idNumber.substring(idNumber.length - 2)}`;
}

export function maskEmail(email: string): string {
    if (!email || !email.includes('@')) return "EMAIL MASKED";
    const [localPart, domainPart] = email.split('@');
    const maskPart = (part: string) => {
        if (part.length <= 2) return part;
        return `${part[0]}${'*'.repeat(part.length - 2)}${part[part.length - 1]}`;
    };
    return `${maskPart(localPart)}@${maskPart(domainPart)}`;
}

function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3958.8;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export const getCurrentMaritimeTime = (): string => {
    const now = new Date();
    return now.toISOString().split('T')[1].split('.')[0] + ' Z';
};
