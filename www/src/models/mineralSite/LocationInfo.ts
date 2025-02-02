import { CandidateEntity } from "./CandidateEntity";

export class LocationInfo {
  location?: string;
  country: CandidateEntity[];
  stateOrProvince: CandidateEntity[];
  crs?: CandidateEntity;

  public constructor({ country, stateOrProvince, location, crs }: { country: CandidateEntity[]; stateOrProvince: CandidateEntity[]; location?: string; crs?: CandidateEntity }) {
    this.location = location;
    this.country = country;
    this.stateOrProvince = stateOrProvince;
    this.crs = crs;
  }

  public static deserialize(obj: any) {
    return new LocationInfo({
      location: obj.location,
      country: obj.country === undefined ? [] : obj.country.map(CandidateEntity.deserialize),
      stateOrProvince: obj.state_or_province === undefined ? [] : obj.state_or_province.map(CandidateEntity.deserialize),
      crs: obj.crs === undefined ? undefined : CandidateEntity.deserialize(obj.crs),
    });
  }

  public clone(): LocationInfo {
    return new LocationInfo({
      location: this.location,
      country: this.country.map((c) => c.clone()),
      stateOrProvince: this.stateOrProvince.map((s) => s.clone()),
      crs: this.crs ? this.crs.clone() : undefined,
    });
  }

  public serialize() {
    return {
      location: this.location,
      country: this.country.map((country) => country.serialize()),
      state_or_province: this.stateOrProvince.map((stateOrProvince) => stateOrProvince.serialize()),
      crs: this.crs?.serialize(),
    };
  }
}

export class Coordinates {
  lat: number;
  lon: number;

  public constructor({ lat, lon }: { lat: number; lon: number }) {
    this.lat = lat;
    this.lon = lon;
  }
}
