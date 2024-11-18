import { RStore, FetchResponse } from "gena-app";
import { SERVER } from "../../env";

export interface Commodity {
  id: string; // not the URI, e.g. "Q578"
  uri: string;
  name: string;
  isCritical: number;
}

export class CommodityStore extends RStore<string, Commodity> {
  constructor() {
    super(`${SERVER}/api/v1/commodities`, undefined, false);
  }

  async fetchCriticalCommotities() {
    if (this.refetch || this.records.size === 0) {
      await this.fetch({});
    }

    const records = [];
    for (const commodity of this.records.values()) {
      if (commodity !== null && commodity.isCritical) {
        records.push(commodity);
      }
    }
    return records;
  }

  public getByName(name: string): Commodity | undefined | null {
    if (this.records.size === 0) {
      return undefined;
    }

    for (const commodity of this.records.values()) {
      if (commodity !== null && commodity.name === name) {
        return commodity;
      }
    }
    return null;
  }

  public deserialize(obj: any): Commodity {
    return {
      id: obj.uri.substring(obj.uri.lastIndexOf("/") + 1),
      uri: obj.uri,
      name: obj.name,
      isCritical: obj.is_critical,
    };
  }

  protected normRemoteSuccessfulResponse(resp: any): FetchResponse {
    return { items: resp.data, total: resp.total };
  }
}
