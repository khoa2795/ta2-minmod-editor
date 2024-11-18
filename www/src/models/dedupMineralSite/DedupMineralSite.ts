import { CountryStore } from "models/country";
import { DepositTypeStore } from "models/depositType";
import { CandidateEntity, GradeTonnage, LocationInfo } from "models/mineralSite";
import { StateOrProvinceStore } from "models/stateOrProvince";
import { InternalID, IRI } from "models/typing";

export class DedupMineralSiteDepositType {
  uri: string;
  source: string;
  confidence: number;

  public constructor({ uri, source, confidence }: { uri: string; source: string; confidence: number }) {
    this.uri = uri;
    this.source = source;
    this.confidence = confidence;
  }

  public toCandidateEntity(stores: { depositTypeStore: DepositTypeStore }): CandidateEntity {
    return new CandidateEntity({
      source: this.source,
      confidence: this.confidence,
      normalizedURI: this.uri,
      observedName: stores.depositTypeStore.get(this.uri)?.name,
    });
  }
}

export class DedupMineralSiteLocation {
  lat?: number;
  lon?: number;
  country: string[];
  stateOrProvince: string[];

  public constructor({ lat, lon, country, stateOrProvince }: { lat?: number; lon?: number; country: string[]; stateOrProvince: string[] }) {
    this.lat = lat;
    this.lon = lon;
    this.country = country;
    this.stateOrProvince = stateOrProvince;
  }

  public static deserialize(record: any): DedupMineralSiteLocation {
    return new DedupMineralSiteLocation({
      lat: record.lat,
      lon: record.lon,
      country: record.country || [],
      stateOrProvince: record.state_or_province || [],
    });
  }

  public toLocationInfo(
    stores: {
      stateOrProvinceStore: StateOrProvinceStore;
      countryStore: CountryStore;
    },
    source: string,
    confidence: number = 1.0
  ) {
    let loc = undefined;
    if (this.lat !== undefined && this.lon !== undefined) {
      loc = `POINT (${this.lon} ${this.lat})`;
    }

    return new LocationInfo({
      location: loc,
      crs: new CandidateEntity({
        source,
        confidence,
        normalizedURI: "https://minmod.isi.edu/resource/Q701",
        observedName: "EPSG:4326",
      }),
      country: this.country.map((country) => {
        return new CandidateEntity({
          source,
          confidence,
          normalizedURI: country,
          observedName: stores.countryStore.get(country)?.name,
        });
      }),
      stateOrProvince: this.stateOrProvince.map((stateOrProvince) => {
        return new CandidateEntity({
          source,
          confidence,
          normalizedURI: stateOrProvince,
          observedName: stores.stateOrProvinceStore.get(stateOrProvince)?.name,
        });
      }),
    });
  }
}

export class DedupMineralSite {
  id: InternalID;
  uri: IRI;
  name: string;
  type: string;
  rank: string;
  sites: string[];
  depositTypes: DedupMineralSiteDepositType[];
  location?: DedupMineralSiteLocation;
  gradeTonnage: GradeTonnage;

  public constructor({
    id,
    uri,
    name,
    type,
    rank,
    sites,
    depositTypes,
    location,
    gradeTonnage,
  }: {
    id: InternalID;
    uri: IRI;
    name: string;
    type: string;
    rank: string;
    sites: string[];
    depositTypes: DedupMineralSiteDepositType[];
    location?: DedupMineralSiteLocation;
    gradeTonnage: GradeTonnage;
  }) {
    this.id = id;
    this.uri = uri;
    this.name = name;
    this.type = type;
    this.rank = rank;
    this.sites = sites;
    this.depositTypes = depositTypes;
    this.location = location;
    this.gradeTonnage = gradeTonnage;
  }

  get commodity(): string {
    return this.gradeTonnage.commodity;
  }

  public static getId(uri: string): string {
    return uri.substring(uri.lastIndexOf("/") + 1);
  }

  public static deserialize(record: any): DedupMineralSite {
    return new DedupMineralSite({
      id: record.id,
      uri: `https://minmod.isi.edu/resource/${record.id}`,
      name: record.name,
      type: record.type,
      rank: record.rank,
      sites: record.sites,
      depositTypes: record.deposit_types.map((depositType: any) => new DedupMineralSiteDepositType(depositType)),
      location: record.location !== undefined ? DedupMineralSiteLocation.deserialize(record.location) : undefined,
      gradeTonnage: GradeTonnage.deserialize(record.grade_tonnage),
    });
  }

  public getTop1DepositType(): DedupMineralSiteDepositType | undefined {
    return this.depositTypes[0];
  }
}
