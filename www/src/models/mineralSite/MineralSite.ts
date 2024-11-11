import { makeObservable, observable } from "mobx";
import { CandidateEntity } from "./CandidateEntity";
import { GradeTonnage } from "./GradeTonnage";
import { LocationInfo } from "./LocationInfo";
import { Reference, Document } from "./Reference";

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
}

export class DraftCreateMineralSite extends MineralSite {
  draftID: string;

  constructor({ draftID, ...rest }: { draftID: string } & MineralSiteConstructorArgs) {
    super(rest);
    this.draftID = draftID;
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
