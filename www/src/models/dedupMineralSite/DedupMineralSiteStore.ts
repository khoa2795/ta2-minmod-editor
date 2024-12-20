import { RStore, FetchResponse, FetchResult, SingleKeyIndex } from "gena-app";
import { SERVER } from "env";
import { Commodity } from "../commodity";
import { DedupMineralSite, DedupMineralSiteDepositType, DedupMineralSiteLocation, DedupMineralSiteOriginalSite } from "./DedupMineralSite";
import axios from "axios";
import { action, makeObservable, runInAction } from "mobx";
import { NamespaceManager } from "../Namespace";
import { GradeTonnage } from "../mineralSite";
import { InternalID } from "../typing";

export class DedupMineralSiteStore extends RStore<string, DedupMineralSite> {
  ns: NamespaceManager;

  constructor(ns: NamespaceManager) {
    super(`${SERVER}/api/v1/dedup-mineral-sites`, undefined, false, [new SingleKeyIndex("commodity", "id")]);
    this.ns = ns;

    makeObservable(this, {
      forceFetchByURI: action,
      deleteByIds: action,
      replaceSites: action,
    });
  }

  get commodity2ids() {
    return this.indices[0] as SingleKeyIndex<string, string, DedupMineralSite>;
  }

  /**
   * Delete dedup mineral sites by their Ids
   * @param ids
   */
  deleteByIds(ids: InternalID[]): void {
    this.state.value = "updating";
    for (const id of ids) {
      const record = this.records.get(id);
      if (record !== undefined && record !== null) {
        this.deindex(record);
        this.records.delete(id);
      }
    }
    this.state.value = "updated";
  }

  /**
   * Replace given dedup sites with new sites
   *
   * @param prevIds previous sites to delete
   * @param newIds new sites to add
   */
  async replaceSites(prevIds: InternalID[], newIds: InternalID[], commodity: Object): Promise<void> {
    this.deleteByIds(prevIds);
    await this.fetchByIds(newIds, true, { commodity });
  }

  async forceFetchByURI(uri: string, commodity: string): Promise<DedupMineralSite | undefined> {
    const id = DedupMineralSite.getId(uri);
    try {
      this.state.value = "updating";

      let resp = await axios.get(`${this.remoteURL}/${id}`, {
        params: { commodity },
      });

      return runInAction(() => {
        let record = this.deserialize(resp.data);
        this.records.set(record.id, record);
        this.index(record);
        this.state.value = "updated";

        return this.records.get(record.id)!;
      });
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        // entity does not exist
        runInAction(() => {
          this.records.set(id, null);
          this.state.value = "updated";
        });
        return undefined;
      }

      runInAction(() => {
        this.state.value = "error";
      });
      throw error;
    }
  }

  async fetchByCommodity(commodity: Commodity): Promise<FetchResult<DedupMineralSite>> {
    if (!this.refetch && this.commodity2ids.index.has(commodity.id)) {
      return this.getByCommodity(commodity);
    }
    return await this.fetch({
      conditions: { commodity: commodity.id },
    });
  }

  public getByCommodity(commodity: Commodity): FetchResult<DedupMineralSite> {
    if (!this.commodity2ids.index.has(commodity.id)) {
      return { records: [], total: 0 };
    }

    const records = [];
    for (const id of this.commodity2ids.index.get(commodity.id)!) {
      records.push(this.records.get(id)!);
    }
    return { records, total: records.length };
  }

  public deserialize(record: any): DedupMineralSite {
    const MR = this.ns.MR;
    const MD = this.ns.MD;

    return new DedupMineralSite({
      id: record.id,
      uri: MD.getURI(record.id),
      name: record.name,
      type: record.type,
      rank: record.rank,
      sites: record.sites.map(
        (site: any) =>
          new DedupMineralSiteOriginalSite({
            id: site.id,
            score: site.score,
          })
      ),
      depositTypes: record.deposit_types.map(
        (depositType: any) =>
          new DedupMineralSiteDepositType({
            uri: MR.getURI(depositType.id),
            source: depositType.source,
            confidence: depositType.confidence,
          })
      ),
      location:
        record.location !== undefined
          ? new DedupMineralSiteLocation({
              lat: record.location.lat,
              lon: record.location.lon,
              country: (record.location.country || []).map((country: string) => MR.getURI(country)),
              stateOrProvince: (record.location.state_or_province || []).map((sop: string) => MR.getURI(sop)),
            })
          : undefined,
      gradeTonnage: GradeTonnage.deserialize(record.grade_tonnage[0]),
      modifiedAt: record.modified_at,
    });
  }

  async updateSameAsGroup(groups: { sites: InternalID[] }[]): Promise<InternalID[]> {
    const resp = await axios.post("/api/v1/same-as", groups);
    return resp.data.map((dedupSite: any) => dedupSite.id);
  }

  protected normRemoteSuccessfulResponse(resp: any): FetchResponse {
    return { items: Array.isArray(resp.data) ? resp.data : Object.values(resp.data), total: resp.total };
  }

  /**
   * Remove a record (by id) from your indexes
   */
  protected deindex(record: DedupMineralSite): void {
    for (const index of this.indices) {
      index.remove(record);
    }
  }
}
