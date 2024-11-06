import { count } from "console";
import { CandidateEntity } from "./CandidateEntity";
import { LocationInfo } from "./LocationInfo";
import { Reference } from "./Reference";

export type MineralSiteProperty = "name" | "location" | "depositType" | "grade" | "tonnage";

export class MineralSite {
  id: string;
  record_id: string;
  source_id: string;
  created_by: string[];
  name: string;
  locationInfo: LocationInfo;
  depositTypeCandidate: CandidateEntity[];
  reference: Reference[];
  sameAs: string[];
  max_grade: Float32Array;
  max_tonnes: Float32Array;

  public constructor({
    id,
    record_id,
    source_id,
    created_by,
    name,
    locationInfo,
    depositTypeCandidate,
    reference,
    sameAs,
    max_grade,
    max_tonnes,
  }: {
    id: string;
    record_id: string;
    source_id: string;
    created_by: string[];
    name: string;
    locationInfo: LocationInfo;
    depositTypeCandidate: CandidateEntity[];
    reference: Reference[];
    sameAs: string[];
    max_grade: Float32Array;
    max_tonnes: Float32Array;
  }) {
    this.id = id;
    this.record_id = record_id;
    this.source_id = source_id;
    this.created_by = created_by;
    this.name = name;
    this.locationInfo = locationInfo;
    this.depositTypeCandidate = depositTypeCandidate;
    this.reference = reference;
    this.sameAs = sameAs;
    this.max_grade = max_grade;
    this.max_tonnes = max_tonnes;
  }

  public update(
    property: MineralSiteProperty,
    value: string,
    reference: Reference
  ): MineralSite {
    // TODO: fix me, remove duplicated reference.
    const another = this.clone();
    another.reference.push(reference);

    switch (property) {
      case "name":
        another.name = value;
        break;
      // TODO: fix me!
      case "depositType":
        another.depositTypeCandidate[0].observed_name=value
        break;
      case "location":
        another.locationInfo.location = value;
        break;
      case "grade":
          another.max_grade = new Float32Array([parseFloat(value)]);
          break;
      case "tonnage":
          another.max_tonnes = new Float32Array([parseFloat(value)]);
          break;
      default:
          throw new Error(`Invalid property: ${property}`);
      }
      return another;
    }
    public getProperty(property: MineralSiteProperty): string {
      switch (property) {
        case "name":
          return this.name;
        case "depositType":
          return this.depositTypeCandidate[0]?.observed_name || "";
        case "location":
          return this.locationInfo.location || "";
        case "grade":
          return this.max_grade ? this.max_grade[0].toFixed(5) : "0.00000";
        case "tonnage":
          return this.max_tonnes ? this.max_tonnes[0].toFixed(5) : "0.00000";
        default:
          throw new Error(`Invalid property: ${property}`);
      }
    }

  public clone(): MineralSite {
    return new MineralSite({
      id: this.id,
      record_id: this.record_id,
      source_id: this.source_id,
      created_by: this.created_by,
      name: this.name,
      locationInfo: this.locationInfo.clone(),
      depositTypeCandidate: this.depositTypeCandidate.map((candidate) =>
        candidate.clone()
      ),
      reference: this.reference.map((reference) => reference.clone()),
      sameAs: this.sameAs,
      max_grade: this.max_grade,
      max_tonnes: this.max_tonnes,
    });
  }

  public static findMineralSiteByUsername(
    mineralSites: MineralSite[],
    username: string
  ): MineralSite | undefined {
    const fullUsername = `/user/${username}`;
    return mineralSites.find((mineralSite) =>
      mineralSite.created_by[0].endsWith(fullUsername)
    );
  }

  public static createDefaultCuratedMineralSite(
    mineralSites: MineralSite[],
    username: string
  ): MineralSite {
    // TODO: should replace it with logic in the backend.
    const curatedMineralSite = mineralSites[0].clone();
    // TODO: fix me, we need to make sure source_id is a valid URL, we will have error when source id is http://example.com?test=abc.
    curatedMineralSite.source_id = `${curatedMineralSite.source_id}?username=${username}`;
    curatedMineralSite.created_by = [`https://minmod.isi.edu/user/${username}`];
    return curatedMineralSite;
  }

  public serialize(): object {
    // convert mineral site to the format that the server required to save the mineral site.
    return {
      id: this.id,
      record_id: this.record_id,
      source_id: this.source_id,
      created_by: this.created_by,
      siteName: this.name,
      // location: this.location,
      // crs: this.crs,
      // country: this.country,
      // state_or_province: this.state_or_province,
      // commodity: this.commodity,
      // depositType: this.depositType,
      // depositConfidence: this.depositConfidence,
      // grade: this.grade,
      // tonnage: this.tonnage,
      reference: this.reference,
      sameAs: this.sameAs,
      max_grade: this.max_grade,
      max_tonnes: this.max_tonnes,
      // comments: this.comments,
    };
  }

  public static deserialize(id: string, obj: any): MineralSite {
    // Calculate max grade and max ore values, with default to 0 if no valid values are found, rounded to 5 decimal places
    const maxGrade = Math.max(
      0,
      ...obj.mineral_inventory
        .filter((inventory: any) => inventory.grade && inventory.grade.value !== undefined)
        .map((inventory: any) => inventory.grade.value)
    );
  
    const maxTonnes = Math.max(
      0,
      ...obj.mineral_inventory
        .filter((inventory: any) => inventory.ore && inventory.ore.value !== undefined)
        .map((inventory: any) => inventory.ore.value)
    );
  
    // Round to 5 decimal places
    const roundedMaxGrade = parseFloat(maxGrade.toFixed(5));
    const roundedMaxTonnes = parseFloat(maxTonnes.toFixed(5));
  
    return new MineralSite({
      id: id,
      record_id: obj.record_id,
      source_id: obj.source_id,
      created_by: obj.created_by,
      name: obj.name,
      locationInfo:
        obj.location_info !== undefined
          ? LocationInfo.deserialize(obj.location_info)
          : new LocationInfo({
              country: [],
              state_or_province: [],
            }),
      depositTypeCandidate: (obj.deposit_type_candidate || []).map(
        CandidateEntity.deserialize
      ),
      reference: obj.reference.map(Reference.deserialize),
      sameAs: obj.sameAs,
      max_grade: new Float32Array([roundedMaxGrade]), // Rounded to 5 decimal places
      max_tonnes: new Float32Array([roundedMaxTonnes]), // Rounded to 5 decimal places
    });
  }
  
  
  
  
  
}
