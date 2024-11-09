export class MineralSiteResp {
  id: string;
  name?: string;
  type: string;
  rank: string;
  country: string[];
  stateOrProvince: string[];

  public constructor({ id, name, type, rank, country, stateOrProvince }: { id: string; name?: string; type: string; rank: string; country: string[]; stateOrProvince: string[] }) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.rank = rank;
    this.country = country;
    this.stateOrProvince = stateOrProvince;
  }

  public static deserialize(obj: any): MineralSiteResp {
    return new MineralSiteResp({
      id: obj.id,
      name: obj.name === null ? undefined : obj.name,
      type: obj.type,
      rank: obj.rank,
      country: obj.country,
      stateOrProvince: obj.state_or_province,
    });
  }
}

export class DepositTypeResp {
  name: string;
  source: string;
  confidence: Number;
  group: string;
  environment: string;

  public constructor({ name, source, confidence, group, environment }: { name: string; source: string; confidence: Number; group: string; environment: string }) {
    this.name = name;
    this.source = source;
    this.confidence = confidence;
    this.group = group;
    this.environment = environment;
  }
}

export class DedupMineralSite {
  id: string;
  commodity: string;
  sites: MineralSiteResp[];
  depositTypes: DepositTypeResp[];
  bestLocCentroidEpsg4326: string;
  latitude?: number;
  longitude?: number;
  totalContainedMetal?: Number;
  totalTonnage?: Number;
  totalGrade?: Number;

  public constructor({
    id,
    commodity,
    sites,
    depositTypes,
    bestLocCentroidEpsg4326,
    totalContainedMetal,
    totalTonnage,
    totalGrade,
    latitude,
    longitude,
  }: {
    id: string;
    commodity: string;
    sites: MineralSiteResp[];
    depositTypes: DepositTypeResp[];
    bestLocCentroidEpsg4326: string;
    totalContainedMetal?: Number;
    totalTonnage?: Number;
    totalGrade?: Number;
    latitude?: number;
    longitude?: number;
  }) {
    this.id = id;
    this.commodity = commodity;
    this.sites = sites;
    this.latitude = latitude;
    this.longitude = longitude;
    this.depositTypes = depositTypes;
    this.bestLocCentroidEpsg4326 = bestLocCentroidEpsg4326;
    this.totalContainedMetal = totalContainedMetal;
    this.totalTonnage = totalTonnage;
    this.totalGrade = totalGrade;
  }

  public static deserialize(record: any): DedupMineralSite {
    const centroid = record.best_loc_centroid_epsg_4326;
    let latitude: number | undefined;
    let longitude: number | undefined;
    if (centroid !== null && centroid !== undefined) {
      const coords = centroid.match(/POINT\s*\(([-\d.]+)\s+([-\d.]+)\)/);
      if (coords && coords.length === 3) {
        latitude = parseFloat(coords[2]);
        longitude = parseFloat(coords[1]);
      }
    }

    return new DedupMineralSite({
      id: record.id,
      commodity: record.commodity,
      latitude: latitude,
      longitude: longitude,
      sites: record.sites.map((site: any) => MineralSiteResp.deserialize(site)),
      depositTypes: record.deposit_types.map((depositType: any) => new DepositTypeResp(depositType)),
      bestLocCentroidEpsg4326: record.best_loc_centroid_epsg_4326,
      totalContainedMetal: record.total_contained_metal === null ? undefined : record.total_contained_metal,
      totalTonnage: record.total_tonnage === null ? undefined : record.total_tonnage,
      totalGrade: record.total_grade === null ? undefined : record.total_grade,
    });
  }

  public getName(): string {
    // TODO: hack, fix me!
    const curatedSite = this.sites.filter((site) => site.id.indexOf("-username-") !== -1);
    if (curatedSite.length > 0) {
      return curatedSite[0].name || "";
    }

    const names = Array.from(new Set(this.sites.map((site) => site.name)));
    if (names.length === 1) {
      return names[0] || "";
    }
    return JSON.stringify(names.sort());
  }

  public getSiteType(): string {
    // TODO: fix me!
    const curatedSite = this.sites.filter((site) => site.id.indexOf("-username-") !== -1);
    if (curatedSite.length > 0) {
      return curatedSite[0].type;
    }

    const types = Array.from(new Set(this.sites.map((site) => site.type)));
    if (types.length === 1) {
      return types[0];
    }
    return JSON.stringify(types.sort());
  }

  public getSiteRank(): string {
    // TODO: fix me!
    const curatedSite = this.sites.filter((site) => site.id.indexOf("-username-") !== -1);
    if (curatedSite.length > 0) {
      return curatedSite[0].rank;
    }
    const ranks = Array.from(new Set(this.sites.map((site) => site.rank)));
    if (ranks.length === 1) {
      return ranks[0];
    }
    return JSON.stringify(ranks.sort());
  }

  public getCountry(): string {
    // TODO: fix me!
    const curatedSite = this.sites.filter((site) => site.id.indexOf("-username-") !== -1);
    if (curatedSite.length > 0) {
      return curatedSite[0].country[0];
    }
    const countries = Array.from(new Set(this.sites.flatMap((site) => site.country)));
    if (countries.length === 1) {
      return countries[0];
    }
    return JSON.stringify(countries.sort());
  }

  public getStateOrProvince(): string {
    // TODO: fix me!
    const curatedSite = this.sites.filter((site) => site.id.indexOf("-username-") !== -1);
    if (curatedSite.length > 0) {
      return curatedSite[0].stateOrProvince[0];
    }
    const stateOrProvinces = Array.from(new Set(this.sites.flatMap((site) => site.stateOrProvince)));
    if (stateOrProvinces.length === 1) {
      return stateOrProvinces[0];
    }
    return JSON.stringify(stateOrProvinces.sort());
  }

  public getTop1DepositType(): DepositTypeResp | undefined {
    return this.depositTypes[0];
  }
}
