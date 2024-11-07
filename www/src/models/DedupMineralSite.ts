import { DepositType } from "./DepositType";

export class ShortMineralSite {
  uri: string;
  name: string;
  type: string;
  rank: string;
  country: string[];
  stateOrProvince: string[];

  public constructor({ uri, name, type, rank, country, stateOrProvince }: { uri: string; name: string; type: string; rank: string; country: string[]; stateOrProvince: string[] }) {
    this.uri = uri;
    this.name = name;
    this.type = type;
    this.rank = rank;
    this.country = country;
    this.stateOrProvince = stateOrProvince;
  }

  public clone(): ShortMineralSite {
    return new ShortMineralSite({
      uri: this.uri,
      name: this.name,
      type: this.type,
      rank: this.rank,
      country: this.country,
      stateOrProvince: this.stateOrProvince,
    });
  }

  public static deserialize(obj: any): ShortMineralSite {
    return new ShortMineralSite({
      uri: obj.id,
      name: obj.name,
      type: obj.type,
      rank: obj.rank,
      country: obj.country,
      stateOrProvince: obj.state_or_province,
    });
  }
}

export class DedupMineralSite {
  uri: string;
  sites: ShortMineralSite[];
  latitude?: number;
  longitude?: number;
  depositTypes: DepositType[];
  commodity: string;
  grade?: number;
  tonnage?: number;

  public constructor({
    uri,
    sites,
    latitude,
    longitude,
    depositTypes,
    commodity,
    grade,
    tonnage,
  }: {
    uri: string;
    sites: ShortMineralSite[];
    latitude?: number;
    longitude?: number;
    depositTypes: DepositType[];
    commodity: string;
    grade?: number;
    tonnage?: number;
  }) {
    this.uri = uri;
    this.sites = sites;
    this.latitude = latitude;
    this.longitude = longitude;
    this.depositTypes = depositTypes;
    this.commodity = commodity;
    this.grade = grade;
    this.tonnage = tonnage;
  }

  public clone(): DedupMineralSite {
    return new DedupMineralSite({
      uri: this.uri,
      sites: this.sites.map((site) => site.clone()),
      latitude: this.latitude,
      longitude: this.longitude,
      depositTypes: this.depositTypes.map((depositType) => depositType.clone()),
      commodity: this.commodity,
      grade: this.grade,
      tonnage: this.tonnage,
    });
  }

  public static deserialize(obj: any): DedupMineralSite {
    const centroid = obj.best_loc_centroid_epsg_4326;
    if (centroid !== null && centroid !== undefined) {
      const coords = centroid.match(/POINT\s*\(([-\d.]+)\s+([-\d.]+)\)/);
      if (coords && coords.length === 3) {
        obj.latitude = parseFloat(coords[2]);
        obj.longitude = parseFloat(coords[1]);
      }
    }

    return new DedupMineralSite({
      uri: obj.id,
      sites: obj.sites.map((site: any) => ShortMineralSite.deserialize(site)),
      latitude: obj.latitude,
      longitude: obj.longitude,
      depositTypes: obj.deposit_types.map((depositType: any) => DepositType.deserialize(depositType)),
      commodity: obj.commodity,
      grade: obj.grade === null ? undefined : obj.grade,
      tonnage: obj.tonnage === null ? undefined : obj.tonnage,
    });
  }

  public getSiteURIs(): string[] {
    return this.sites.map((site) => site.uri);
  }

  public getName(): string {
    // TODO: hack, fix me!
    const curatedSite = this.sites.filter((site) => site.uri.indexOf("-username-") !== -1);
    if (curatedSite.length > 0) {
      return curatedSite[0].name;
    }

    const names = Array.from(new Set(this.sites.map((site) => site.name)));
    if (names.length === 1) {
      return names[0];
    }
    return JSON.stringify(names.sort());
  }

  public getSiteType(): string {
    // TODO: fix me!
    const curatedSite = this.sites.filter((site) => site.uri.indexOf("-username-") !== -1);
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
    const curatedSite = this.sites.filter((site) => site.uri.indexOf("-username-") !== -1);
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
    const curatedSite = this.sites.filter((site) => site.uri.indexOf("-username-") !== -1);
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
    const curatedSite = this.sites.filter((site) => site.uri.indexOf("-username-") !== -1);
    if (curatedSite.length > 0) {
      return curatedSite[0].stateOrProvince[0];
    }
    const stateOrProvinces = Array.from(new Set(this.sites.flatMap((site) => site.stateOrProvince)));
    if (stateOrProvinces.length === 1) {
      return stateOrProvinces[0];
    }
    return JSON.stringify(stateOrProvinces.sort());
  }

  public getTop1DepositType(): DepositType | undefined {
    return this.depositTypes[0];
  }
}
