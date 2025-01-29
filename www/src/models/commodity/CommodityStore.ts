import { RStore, FetchResponse, SingleKeyUniqueIndex } from "gena-app";
import { SERVER } from "env";
import { InternalID, IRI } from "models/typing";
import { NamespaceManager } from "models/Namespace";

export interface Commodity {
  id: InternalID; // not the URI, e.g. "Q578"
  uri: IRI;
  name: string;
  isCritical: number;
}

export class CommodityStore extends RStore<string, Commodity> {
  ns: NamespaceManager;

  constructor(ns: NamespaceManager) {
    super(`${SERVER}/api/v1/commodities`, undefined, false, [new SingleKeyUniqueIndex("name", "id"), new SingleKeyUniqueIndex("uri", "id")]);
    this.ns = ns;
  }

  get name2id() {
    return this.indices[0] as SingleKeyUniqueIndex<string, string, Commodity>;
  }

  get uri2id() {
    return this.indices[1] as SingleKeyUniqueIndex<IRI, InternalID, Commodity>;
  }

  async fetchAll(): Promise<void> {
    if (this.refetch || this.records.size === 0) {
      await this.fetch({});
    }
  }

  public getByURI(uri: string): Commodity | undefined {
    let id = this.uri2id.index.get(uri);
    return id === undefined ? undefined : this.records.get(id)!;
  }

  public getCriticalCommodities(): Commodity[] {
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
    if (this.name2id.index.has(name)) {
      return this.get(this.name2id.index.get(name)!)!;
    }
    return null;
  }

  public deserialize(obj: any): Commodity {
    return {
      id: this.ns.MR.getID(obj.uri),
      uri: obj.uri,
      name: obj.name,
      isCritical: obj.is_critical,
    };
  }

  protected normRemoteSuccessfulResponse(resp: any): FetchResponse {
    return { items: resp.data, total: resp.data.length };
  }
}
