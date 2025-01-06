import { SERVER } from "env";
import { CRUDStore, FetchResponse } from "gena-app";
import { MineralSite, DraftCreateMineralSite, DraftUpdateMineralSite } from "./MineralSite";
import { LocationInfo } from "./LocationInfo";
import { CandidateEntity } from "./CandidateEntity";
import { Reference } from "./Reference";
import { GradeTonnage } from "./GradeTonnage";
import { DedupMineralSiteStore } from "../dedupMineralSite";
import { MineralInventory } from "./MineralInventory";

export class MineralSiteStore extends CRUDStore<string, DraftCreateMineralSite, DraftUpdateMineralSite, MineralSite> {
  dedupMineralSiteStore: DedupMineralSiteStore;

  constructor(dedupMineralSiteStore: DedupMineralSiteStore) {
    super(`${SERVER}/api/v1/mineral-sites`, undefined, false);
    this.dedupMineralSiteStore = dedupMineralSiteStore;
  }

  async createAndUpdateDedup(commodity: string, draft: DraftCreateMineralSite, discardDraft: boolean = true): Promise<MineralSite> {
    const record = await this.create(draft, discardDraft);
    await this.dedupMineralSiteStore.forceFetchByURI(record.dedupSiteURI, commodity);
    return record;
  }

  async updateAndUpdateDedup(commodity: string, draft: DraftUpdateMineralSite, discardDraft: boolean = true): Promise<MineralSite> {
    const record = await this.update(draft, discardDraft);
    await this.dedupMineralSiteStore.forceFetchByURI(record.dedupSiteURI, commodity);
    return record;
  }

  public deserialize(record: any): MineralSite {
    return new MineralSite({
      id: record.id,
      recordId: record.record_id,
      sourceId: record.source_id,
      dedupSiteURI: record.dedup_site_uri,
      createdBy: record.created_by,
      name: record.name,
      locationInfo:
        record.location_info !== undefined
          ? LocationInfo.deserialize(record.location_info)
          : new LocationInfo({
            country: [],
            stateOrProvince: [],
          }),
      depositTypeCandidate: (record.deposit_type_candidate || []).map(CandidateEntity.deserialize),
      reference: record.reference.map(Reference.deserialize),
      sameAs: record.same_as,
      gradeTonnage: Object.fromEntries(
        record.grade_tonnage.map((val: any) => {
          const gt = GradeTonnage.deserialize(val);
          return [gt.commodity, gt];
        })
      ),
      mineralInventory: record.mineral_inventory.map(MineralInventory.deserialize),
    });
  }

  public serializeRecord(record: DraftCreateMineralSite | DraftUpdateMineralSite): object {
    // convert mineral site to the format that the server required to save the mineral site.
    // TODO: validate for the location
    const reference = record.reference.map((ref) => ref.serialize());
    return {
      name: record.name,
      record_id: record.recordId,
      source_id: record.sourceId,
      created_by: record.createdBy,
      dedup_site_uri: record.dedupSiteURI === "" ? undefined : record.dedupSiteURI,
      location_info: {
        country: record.locationInfo.country.map((country) => country.serialize()),
        state_or_province: record.locationInfo.stateOrProvince.map((state_or_province) => state_or_province.serialize()),
        crs: record.locationInfo.crs?.serialize(),
        location: record.locationInfo.location,
      },
      deposit_type_candidate: record.depositTypeCandidate.map((depositTypeCandidate) => depositTypeCandidate.serialize()),
      mineral_inventory: record.mineralInventory.map((mineralInventory) => mineralInventory.serialize()),
      reference: reference,
      same_as: record.sameAs,
    };
  }

  protected normRemoteSuccessfulResponse(resp: any): FetchResponse {
    return { items: Array.isArray(resp.data) ? resp.data : Object.values(resp.data), total: resp.data.length };
  }
}
