import { CandidateEntity } from "./CandidateEntity";
import { GradeTonnage } from "./GradeTonnage";
import { LocationInfo } from "./LocationInfo";
import { Reference, Document } from "./Reference";
import { DedupMineralSite, DedupMineralSiteLocation } from "../dedupMineralSite";
import { DepositTypeStore } from "models/depositType";
import { StateOrProvinceStore } from "models/stateOrProvince";
import { CountryStore } from "models/country";
import { MineralInventory } from "./MineralInventory";
import { IStore } from "models";
import { InternalID } from "models/typing";

export type EditableField = "name" | "location" | "depositType" | "grade" | "tonnage";
export type FieldEdit =
  | { field: "name"; value: string }
  | { field: "location"; value: string }
  | { field: "depositType"; observedName: string; normalizedURI: string }
  | {
    field: "grade";
    value: number;
    commodity: string;
  }
  | { field: "tonnage"; value: number; commodity: string };

export type MineralSiteConstructorArgs = {
  id: InternalID;
  recordId: string;
  sourceId: string;
  dedupSiteURI: string;
  createdBy: string[];
  name: string;
  locationInfo: LocationInfo;
  depositTypeCandidate: CandidateEntity[];
  reference: Reference[];
  sameAs: string[];
  gradeTonnage: { [commodity: string]: GradeTonnage };
  mineralInventory: MineralInventory[];
};

export class MineralSite {
  id: InternalID;
  sourceId: string;
  recordId: string;
  dedupSiteURI: string;
  createdBy: string[];
  name: string;
  locationInfo: LocationInfo;
  depositTypeCandidate: CandidateEntity[];
  reference: Reference[];
  sameAs: string[];
  gradeTonnage: { [commodity: string]: GradeTonnage };
  mineralInventory: MineralInventory[];

  public constructor({ id, recordId, sourceId, createdBy, name, locationInfo, depositTypeCandidate, reference, sameAs, gradeTonnage, dedupSiteURI, mineralInventory }: MineralSiteConstructorArgs) {
    this.id = id;
    this.recordId = recordId;
    this.sourceId = sourceId;
    this.dedupSiteURI = dedupSiteURI;
    this.createdBy = createdBy;
    this.name = name;
    this.locationInfo = locationInfo;
    this.depositTypeCandidate = depositTypeCandidate;
    this.reference = reference;
    this.sameAs = sameAs;
    this.gradeTonnage = gradeTonnage;
    this.mineralInventory = mineralInventory;
  }

  get uri(): string {
    return `https://minmod.isi.edu/resource/${this.id}`;
  }

  getReferencedDocuments(): { [uri: string]: Document } {
    const docs: { [uri: string]: Document } = {};
    for (const ref of this.reference) {
      docs[ref.document.uri] = ref.document;
    }
    return docs;
  }

  getFirstReferencedDocument(): Document {
    return this.reference[0].document;
  }

  updateField(stores: IStore, edit: FieldEdit, reference: Reference) {
    switch (edit.field) {
      case "name":
        this.name = edit.value;
        break;
      case "location":
        this.locationInfo.location = edit.value;
        break;
      case "depositType":
        this.depositTypeCandidate = [
          new CandidateEntity({
            source: this.createdBy[0], // this works because createdBy is a single item array for experts
            confidence: 1.0,
            normalizedURI: edit.normalizedURI,
            observedName: edit.observedName,
          }),
        ];
        break;
      case "grade":
        if (this.gradeTonnage[edit.commodity] === undefined) {
          this.gradeTonnage[edit.commodity] = new GradeTonnage({
            commodity: edit.commodity,
            totalGrade: edit.value,
            totalTonnage: 0.0,
          });
        } else {
          this.gradeTonnage[edit.commodity].totalGrade = edit.value;
          if (this.gradeTonnage[edit.commodity].totalTonnage === undefined) {
            this.gradeTonnage[edit.commodity].totalTonnage = 0.0;
          }
        }

        this.mineralInventory = [MineralInventory.fromGradeTonnage(stores, this.createdBy[0], this.gradeTonnage[edit.commodity], reference)];
        break;
      case "tonnage":
        if (this.gradeTonnage[edit.commodity] === undefined) {
          this.gradeTonnage[edit.commodity] = new GradeTonnage({
            commodity: edit.commodity,
            totalTonnage: edit.value,
            // set the grade to be very small, so the server is not going to discard this record
            totalGrade: 0.000000001,
          });
        } else {
          this.gradeTonnage[edit.commodity].totalTonnage = edit.value;
          if (this.gradeTonnage[edit.commodity].totalGrade === undefined) {
            this.gradeTonnage[edit.commodity].totalGrade = 0.000000001;
          }
        }

        this.mineralInventory = [MineralInventory.fromGradeTonnage(stores, this.createdBy[0], this.gradeTonnage[edit.commodity], reference)];
        break;
      default:
        throw new Error(`Unknown edit: ${edit}`);
    }

    // TODO: fix me, we need to avoid duplicated reference
    this.reference.push(reference);
  }
}

export class DraftCreateMineralSite extends MineralSite {
  draftID: string;

  constructor({ draftID, ...rest }: { draftID: string } & MineralSiteConstructorArgs) {
    super(rest);
    this.draftID = draftID;
  }

  public static fromMineralSite(
    stores: { depositTypeStore: DepositTypeStore; stateOrProvinceStore: StateOrProvinceStore; countryStore: CountryStore },
    dedupMineralSite: DedupMineralSite,
    sites: MineralSite[],
    username: string,
    reference: Reference
  ): DraftCreateMineralSite {
    const baseSite = sites[0].id === dedupMineralSite.sites[0] ? sites[0] : sites.filter((site) => site.id === dedupMineralSite.sites[0])[0];
    const createdBy = `https://minmod.isi.edu/users/${username}`;
    const confidence = 1.0;

    return new DraftCreateMineralSite({
      draftID: `draft-${dedupMineralSite.id}`,
      id: "", // backend does not care about uri as they will recalculate it
      sourceId: DraftCreateMineralSite.updateSourceId(baseSite.sourceId, username),
      recordId: baseSite.recordId,
      dedupSiteURI: dedupMineralSite.uri,
      createdBy: [createdBy],
      name: "",
      locationInfo: new LocationInfo({ country: [], stateOrProvince: [] }),
      depositTypeCandidate: [],
      reference: [reference],
      sameAs: [],
      gradeTonnage: {},
      mineralInventory: [],
    });
  }

  public static updateSourceId(sourceId: string, username: string): string {
    const [sourceType, sourceIdent] = sourceId.split("::", 2);
    const url = new URL(sourceIdent);
    url.searchParams.set("username", username);
    return `${sourceType}::${url.toString()}`;
  }
}

export class DraftUpdateMineralSite extends MineralSite {
  isSaved: boolean = true;

  updateField(stores: IStore, edit: FieldEdit, reference: Reference) {
    super.updateField(stores, edit, reference);
    this.isSaved = false;
  }

  markSaved() {
    this.isSaved = true;
  }

  toModel(): MineralSite {
    return new MineralSite(this);
  }
}
