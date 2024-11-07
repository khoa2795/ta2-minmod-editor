import { count } from "console";
import { CandidateEntity } from "./CandidateEntity";
import { LocationInfo } from "./LocationInfo";
import { Reference } from "./Reference";
import { GradeTonnageOfCommodity } from "./GradeTonnageOfCommodity";
import { gt } from "lodash";

export type MineralSiteProperty = "name" | "location" | "depositType" | "grade" | "tonnage";

export class MineralSite {
  id: string;
  sourceId: string;
  recordId: string;
  createdBy: string[];
  name: string;
  locationInfo: LocationInfo;
  depositTypeCandidate: CandidateEntity[];
  reference: Reference[];
  sameAs: string[];
  gradeTonnage: { [commodity: string]: GradeTonnageOfCommodity };

  public constructor({
    id,
    recordId,
    sourceId,
    createdBy,
    name,
    locationInfo,
    depositTypeCandidate,
    reference,
    sameAs,
    gradeTonnage,
  }: {
    id: string;
    recordId: string;
    sourceId: string;
    createdBy: string[];
    name: string;
    locationInfo: LocationInfo;
    depositTypeCandidate: CandidateEntity[];
    reference: Reference[];
    sameAs: string[];
    gradeTonnage: { [commodity: string]: GradeTonnageOfCommodity };
  }) {
    this.id = id;
    this.recordId = recordId;
    this.sourceId = sourceId;
    this.createdBy = createdBy;
    this.name = name;
    this.locationInfo = locationInfo;
    this.depositTypeCandidate = depositTypeCandidate;
    this.reference = reference;
    this.sameAs = sameAs;
    this.gradeTonnage = gradeTonnage;
  }

  public update(property: MineralSiteProperty, value: string, reference: Reference): MineralSite {
    // TODO: fix me, remove duplicated reference.
    const another = this.clone();
    another.reference.push(reference);

    switch (property) {
      case "name":
        another.name = value;
        break;
      // TODO: fix me!
      case "depositType":
        another.depositTypeCandidate[0].observed_name = value;
        break;
      case "location":
        another.locationInfo.location = value;
        break;
      case "grade":
        // another.max_grade = new Float32Array([parseFloat(value)]);
        break;
      case "tonnage":
        // another.max_tonnes = new Float32Array([parseFloat(value)]);
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
      // return this.max_grade ? this.max_grade[0].toFixed(5) : "0.00000";
      case "tonnage":
      // return this.max_tonnes ? this.max_tonnes[0].toFixed(5) : "0.00000";
      default:
        throw new Error(`Invalid property: ${property}`);
    }
  }

  public clone(): MineralSite {
    return new MineralSite({
      id: this.id,
      recordId: this.recordId,
      sourceId: this.sourceId,
      createdBy: this.createdBy,
      name: this.name,
      locationInfo: this.locationInfo.clone(),
      depositTypeCandidate: this.depositTypeCandidate.map((candidate) => candidate.clone()),
      reference: this.reference.map((reference) => reference.clone()),
      sameAs: this.sameAs,
      gradeTonnage: Object.fromEntries(Object.entries(this.gradeTonnage).map(([key, value]) => [key, value.clone()])),
    });
  }

  public static findMineralSiteByUsername(mineralSites: MineralSite[], username: string): MineralSite | undefined {
    const fullUsername = `/user/${username}`;
    return mineralSites.find((mineralSite) => mineralSite.createdBy[0].endsWith(fullUsername));
  }

  public static createDefaultCuratedMineralSite(mineralSites: MineralSite[], username: string): MineralSite {
    // TODO: should replace it with logic in the backend.
    const curatedMineralSite = mineralSites[0].clone();
    // TODO: fix me, we need to make sure source_id is a valid URL, we will have error when source id is http://example.com?test=abc.
    curatedMineralSite.sourceId = `${curatedMineralSite.sourceId}?username=${username}`;
    curatedMineralSite.createdBy = [`https://minmod.isi.edu/user/${username}`];
    return curatedMineralSite;
  }

  public serialize(): object {
    // convert mineral site to the format that the server required to save the mineral site.
    return {
      record_id: this.recordId,
      source_id: this.sourceId,
      created_by: this.createdBy,
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
      // comments: this.comments,
    };
  }

  public static deserialize(id: string, obj: any): MineralSite {
    return new MineralSite({
      id: id,
      recordId: obj.record_id,
      sourceId: obj.source_id,
      createdBy: obj.created_by,
      name: obj.name,
      locationInfo:
        obj.location_info !== undefined
          ? LocationInfo.deserialize(obj.location_info)
          : new LocationInfo({
              country: [],
              state_or_province: [],
            }),
      depositTypeCandidate: (obj.deposit_type_candidate || []).map(CandidateEntity.deserialize),
      reference: obj.reference.map(Reference.deserialize),
      sameAs: obj.same_as,
      gradeTonnage: Object.fromEntries(
        obj.grade_tonnage.map((val: any) => {
          const gt = GradeTonnageOfCommodity.deserialize(val);
          return [gt.commodity, gt];
        })
      ),
    });
  }
}
