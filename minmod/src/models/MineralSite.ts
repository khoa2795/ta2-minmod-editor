import { Reference } from "./Reference";

export type MineralSiteProperty = "siteName" | "depositType" | "location";

export class MineralSite {
  id: number;
  record_id: string;
  source_id: string;
  created_by: string;
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
  reference: Reference[];
  comments?: string; // New comments field
  sameAs: string[];

  public constructor(
    id: number,
    record_id: string,
    source_id: string,
    created_by: string,
    siteName: string,
    location: string,
    crs: string,
    country: string,
    state_or_province: string,
    commodity: string,
    depositType: string,
    depositConfidence: string,
    grade: string,
    tonnage: string,
    reference: Reference[],
    sameAs: string[],
    comments?: string
  ) {
    this.id = id;
    this.record_id = record_id;
    this.source_id = source_id;
    this.created_by = created_by;
    this.siteName = siteName;
    this.location = location;
    this.crs = crs;
    this.country = country;
    this.state_or_province = state_or_province;
    this.commodity = commodity;
    this.depositType = depositType;
    this.depositConfidence = depositConfidence;
    this.grade = grade;
    this.tonnage = tonnage;
    this.reference = reference;
    this.sameAs = sameAs;
    this.comments = comments;
  }

  public update(property: MineralSiteProperty, value: string, reference: Reference): MineralSite {
    // TODO: fix me, remove duplicated reference.
    const another = this.clone();
    another.reference.push(reference);

    switch (property) {
      case "siteName":
        another.siteName = value;
        break;
      case "depositType":
        another.depositType = value;
        break;
      case "location":
        another.location = value;
        break;
      default:
        throw new Error(`Invalid property: ${property}`);
    }
    return another;
  }

  public getProperty(property: MineralSiteProperty): string {
    switch (property) {
      case "siteName":
        return this.siteName;
      case "depositType":
        return this.depositType;
      case "location":
        return this.location;
      default:
        throw new Error(`Invalid property: ${property}`);
    }
  }

  public clone(): MineralSite {
    return new MineralSite(
      this.id,
      this.record_id,
      this.source_id,
      this.created_by,
      this.siteName,
      this.location,
      this.crs,
      this.country,
      this.state_or_province,
      this.commodity,
      this.depositType,
      this.depositConfidence,
      this.grade,
      this.tonnage,
      this.reference,
      this.sameAs,
      this.comments
    );
  }

  public static findMineralSiteByUsername(mineralSites: MineralSite[], username: string): MineralSite | undefined {
    const fullUsername = `/user/${username}`;
    return mineralSites.find((mineralSite) => mineralSite.created_by.endsWith(fullUsername));
  }

  public static createDefaultCuratedMineralSite(mineralSites: MineralSite[], username: string): MineralSite {
    // TODO: should replace it with logic in the backend.
    const curatedMineralSite = mineralSites[0].clone();
    // TODO: fix me, we need to make sure source_id is a valid URL, we will have error when source id is http://example.com?test=abc.
    curatedMineralSite.source_id = `${curatedMineralSite.source_id}?username=${username}`;
    curatedMineralSite.created_by = `https://minmod.isi.edu/user/${username}`;
    return curatedMineralSite;
  }

  public serialize(): object {
    // convert mineral site to the format that the server required to save the mineral site.
    return {
      id: this.id,
      record_id: this.record_id,
      source_id: this.source_id,
      created_by: this.created_by,
      siteName: this.siteName,
      location: this.location,
      crs: this.crs,
      country: this.country,
      state_or_province: this.state_or_province,
      commodity: this.commodity,
      depositType: this.depositType,
      depositConfidence: this.depositConfidence,
      grade: this.grade,
      tonnage: this.tonnage,
      reference: this.reference,
      sameAs: this.sameAs,
      comments: this.comments,
    };
  }
}
