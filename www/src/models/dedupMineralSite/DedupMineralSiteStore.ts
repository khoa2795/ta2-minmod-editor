import { RStore, FetchResponse, FetchResult, SingleKeyIndex } from "gena-app";
import { SERVER } from "../../env";
import { runInAction } from "mobx";
import { Commodity } from "models/commodity";
import { DedupMineralSite, DepositTypeResp, MineralSiteResp } from "./DedupMineralSite";

export class DedupMineralSiteStore extends RStore<string, DedupMineralSite> {
  constructor() {
    super(`${SERVER}/api/v1/dedup-mineral-sites`, undefined, false, [new SingleKeyIndex("commodity", "id")]);
  }

  get commodity2ids() {
    return this.indices[0] as SingleKeyIndex<string, string, DedupMineralSite>;
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
    return DedupMineralSite.deserialize(record);
  }

  protected normRemoteSuccessfulResponse(resp: any): FetchResponse {
    return { items: resp.data, total: resp.total };
  }
}
