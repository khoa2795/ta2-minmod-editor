import { RStore, FetchResponse, FetchResult, SingleKeyIndex } from "gena-app";
import { SERVER } from "../../env";
import { Commodity } from "models/commodity";
import { DedupMineralSite, DedupMineralSiteDepositType, DedupMineralSiteLocation } from "./DedupMineralSite";
import axios from "axios";
import { action, makeObservable, runInAction } from "mobx";
import { NamespaceManager } from "models/Namespace";
import { GradeTonnage } from "models/mineralSite";

export class DedupMineralSiteStore extends RStore<string, DedupMineralSite> {
  ns: NamespaceManager;

  constructor(ns: NamespaceManager) {
    super(`${SERVER}/api/v1/dedup-mineral-sites`, undefined, false, [new SingleKeyIndex("commodity", "id")]);
    this.ns = ns;

    makeObservable(this, {
      forceFetchByURI: action,
    });
  }

  get commodity2ids() {
    return this.indices[0] as SingleKeyIndex<string, string, DedupMineralSite>;
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

    return new DedupMineralSite({
      id: record.id,
      uri: MR.getURI(record.id),
      name: record.name,
      type: record.type,
      rank: record.rank,
      sites: record.sites,
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
      gradeTonnage: GradeTonnage.deserialize(record.grade_tonnage),
    });
  }

  protected normRemoteSuccessfulResponse(resp: any): FetchResponse {
    return { items: resp.data, total: resp.total };
  }
}
