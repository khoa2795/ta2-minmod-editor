import { SERVER } from "env";
import { CRUDStore, FetchResponse } from "gena-app";
import { MineralSite, DraftCreateMineralSite, DraftUpdateMineralSite } from "./MineralSite";
import { Coordinates, LocationInfo } from "./LocationInfo";
import { CandidateEntity } from "./CandidateEntity";
import { Reference } from "./Reference";
import { GradeTonnage } from "./GradeTonnage";
import { DedupMineralSiteStore } from "../dedupMineralSite";
import { MineralInventory } from "./MineralInventory";
import { GeologyInfo } from "./GeologyInfo";

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
      name: record.name,
      createdBy: record.created_by,
      aliases: record.aliases,
      locationInfo: record.location_info !== undefined ? LocationInfo.deserialize(record.location_info) : undefined,
      depositTypeCandidate: (record.deposit_type_candidate || []).map(CandidateEntity.deserialize),
      mineralForm: record.mineral_form || [],
      geologyInfo: record.geology_info !== undefined ? GeologyInfo.deserialize(record.geology_info) : undefined,
      mineralInventory: (record.mineral_inventory || []).map(MineralInventory.deserialize),
      discoveredYear: record.discovered_year,
      reference: (record.reference || []).map(Reference.deserialize)[0],
      modifiedAt: record.modified_at,
      coordinates: record.coordinates === undefined ? undefined : new Coordinates(record.coordinates),
      gradeTonnage: Object.fromEntries(
        (record.grade_tonnage || []).map((val: any) => {
          const gt = GradeTonnage.deserialize(val);
          return [gt.commodity, gt];
        })
      ),
    });
  }

  public serializeRecord(record: DraftCreateMineralSite | DraftUpdateMineralSite): object {
    // convert mineral site to the format that the server required to save the mineral site.
    // TODO: validate for the location
    return {
      source_id: record.sourceId,
      record_id: record.recordId,
      created_by: record.createdBy,
      dedup_site_uri: record.dedupSiteURI === "" ? undefined : record.dedupSiteURI,
      name: record.name,
      aliases: record.aliases,
      site_rank: record.siteRank,
      site_type: record.siteType,
      mineral_form: record.mineralForm,
      geology_info: record.geologyInfo?.serialize(),
      location_info: record.locationInfo?.serialize(),
      deposit_type_candidate: record.depositTypeCandidate.map((depositTypeCandidate) => depositTypeCandidate.serialize()),
      mineral_inventory: record.mineralInventory.map((mineralInventory) => mineralInventory.serialize()),
      reference: [record.reference.serialize()],
      discovered_year: record.discoveredYear,
    };
  }

  protected normRemoteSuccessfulResponse(resp: any): FetchResponse {
    return { items: Array.isArray(resp.data) ? resp.data : Object.values(resp.data), total: resp.data.length };
  }
}
