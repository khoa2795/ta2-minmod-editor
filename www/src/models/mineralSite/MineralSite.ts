import { makeObservable, observable } from "mobx";
import { CandidateEntity } from "./CandidateEntity";
import { GradeTonnage } from "./GradeTonnage";
import { LocationInfo } from "./LocationInfo";
import { Reference, Document } from "./Reference";
import { DedupMineralSite, DedupMineralSiteLocation } from "models/dedupMineralSite";
import { DepositTypeStore } from "models/depositType";
import { StateOrProvinceStore } from "models/stateOrProvince";
import { CountryStore } from "models/country";

export type EditableField = "name" | "location" | "depositType";

export type MineralSiteConstructorArgs = {
  uri: string;
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
};

export class MineralSite {
  uri: string;
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

  public constructor({ uri, recordId, sourceId, createdBy, name, locationInfo, depositTypeCandidate, reference, sameAs, gradeTonnage, dedupSiteURI }: MineralSiteConstructorArgs) {
    this.uri = uri;
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
  }

  get id() {
    return this.uri;
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

  // updateField(field: EditableField, value: string, reference: Reference) {
  //   switch (field) {

  //   }
  // }
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
    const baseSite = sites[0].uri === dedupMineralSite.sites[0] ? sites[0] : sites.filter((site) => site.uri === dedupMineralSite.sites[0])[0];
    const createdBy = `https://minmod.isi.edu/users/${username}`;
    const confidence = 1.0;

    return new DraftCreateMineralSite({
      draftID: `draft-${dedupMineralSite.id}`,
      uri: "", // backend does not care about uri as they will recalculate it
      sourceId: DraftCreateMineralSite.updateSourceId(baseSite.sourceId, username),
      recordId: baseSite.recordId,
      dedupSiteURI: dedupMineralSite.uri,
      createdBy: [createdBy],
      name: dedupMineralSite.name,
      locationInfo: (
        dedupMineralSite.location ||
        new DedupMineralSiteLocation({
          country: [],
          stateOrProvince: [],
        })
      )?.toLocationInfo(stores, createdBy, confidence),
      depositTypeCandidate: dedupMineralSite.depositTypes.length > 0 ? [dedupMineralSite.getTop1DepositType()!.toCandidateEntity(stores)] : [],
      reference: [reference],
      sameAs: dedupMineralSite.sites,
      gradeTonnage: {
        [dedupMineralSite.gradeTonnage.commodity]: dedupMineralSite.gradeTonnage,
      },
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

  markSaved() {
    this.isSaved = true;
  }

  toModel(): MineralSite {
    return new MineralSite(this);
  }
}
