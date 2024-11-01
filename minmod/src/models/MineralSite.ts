export interface MineralSite {
    id: number;
    record_id: string;
    siteName: string;
    location: string;
    crs: string;
    country: string;
    state_or_province: string;
    commodity: string;
    depositType: string;
    depositConfidence: string;
    grade: string;
    tonnage: string;
    reference?: string;
    comments?: string; // New comments field
    source_id: string;
}
