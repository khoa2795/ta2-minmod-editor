export class DedupMineralSite {
  id: number;
  siteName: string;
  siteType: string;
  siteRank: string;
  location: string;
  crs: string;
  country: string;
  state: string;
  depositType: string;
  depositConfidence: string;
  commodity: string;
  grade: string;
  tonnage: string;
  all_ms_fields: string[];

  constructor(
    id: number,
    siteName: string,
    siteType: string,
    siteRank: string,
    location: string,
    crs: string,
    country: string,
    state: string,
    depositType: string,
    depositConfidence: string,
    commodity: string,
    grade: string,
    tonnage: string,
    all_ms_fields: string[]
  ) {
    this.id = id;
    this.siteName = siteName;
    this.siteType = siteType;
    this.siteRank = siteRank;
    this.location = location;
    this.crs = crs;
    this.country = country;
    this.state = state;
    this.depositType = depositType;
    this.depositConfidence = depositConfidence;
    this.commodity = commodity;
    this.grade = grade;
    this.tonnage = tonnage;
    this.all_ms_fields = all_ms_fields;
  }

  public getProperty(property: keyof DedupMineralSite): string | string[] | number {
    return this[property] as string | string[] | number;
  }

  public clone(): DedupMineralSite {
    return new DedupMineralSite(
      this.id,
      this.siteName,
      this.siteType,
      this.siteRank,
      this.location,
      this.crs,
      this.country,
      this.state,
      this.depositType,
      this.depositConfidence,
      this.commodity,
      this.grade,
      this.tonnage,
      [...this.all_ms_fields] // Clone the array to avoid reference issues
    );
  }

  public static deserialize(obj: any): DedupMineralSite {
    return new DedupMineralSite(
      obj.id,
      obj.siteName,
      obj.siteType,
      obj.siteRank,
      obj.location,
      obj.crs,
      obj.country,
      obj.state,
      obj.depositType,
      obj.depositConfidence,
      obj.commodity,
      obj.grade,
      obj.tonnage,
      obj.all_ms_fields
    );
  }
}
