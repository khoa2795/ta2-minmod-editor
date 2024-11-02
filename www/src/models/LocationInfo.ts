import { CandidateEntity } from "./CandidateEntity";

export class LocationInfo {
  location?: string;
  country: CandidateEntity[];
  state_or_province: CandidateEntity[];
  crs?: CandidateEntity;

  public constructor({
    country,
    state_or_province,
    location,
    crs,
  }: {
    country: CandidateEntity[];
    state_or_province: CandidateEntity[];
    location?: string;
    crs?: CandidateEntity;
  }) {
    this.location = location;
    this.country = country;
    this.state_or_province = state_or_province;
    this.crs = crs;
  }

  public static deserialize(obj: any) {
    return new LocationInfo({
      location: obj.location,
      country:
        obj.country === null
          ? []
          : obj.country.map(CandidateEntity.deserialize),
      state_or_province:
        obj.state_or_province === null
          ? []
          : obj.state_or_province.map(CandidateEntity.deserialize),
      crs: obj.crs === null ? undefined : CandidateEntity.deserialize(obj.crs),
    });
  }

  public clone(): LocationInfo {
    return new LocationInfo({
      location: this.location,
      country: this.country.map((c) => c.clone()),
      state_or_province: this.state_or_province.map((s) => s.clone()),
      crs: this.crs ? this.crs.clone() : undefined,
    });
  }
}
