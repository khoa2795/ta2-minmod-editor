import { RStore, FetchResponse, SingleKeyUniqueIndex } from "gena-app";
import { SERVER } from "env";
import { InternalID, IRI } from "models/typing";
import { NamespaceManager } from "models/Namespace";

export interface Country {
  id: InternalID;
  uri: IRI;
  name: string;
}

export class CountryStore extends RStore<string, Country> {
  ns: NamespaceManager;

  constructor(ns: NamespaceManager) {
    super(`${SERVER}/api/v1/countries`, undefined, false, [new SingleKeyUniqueIndex("name", "id"), new SingleKeyUniqueIndex("uri", "id")]);
    this.ns = ns;
  }

  get name2id() {
    return this.indices[0] as SingleKeyUniqueIndex<string, InternalID, Country>;
  }

  get uri2id() {
    return this.indices[1] as SingleKeyUniqueIndex<IRI, InternalID, Country>;
  }

  public getByURI(uri: IRI): Country | undefined {
    if (this.uri2id.index.has(uri)) {
      const record = this.records.get(this.uri2id.index.get(uri)!);
      if (record === null) return undefined;
      return record;
    }
    return undefined;
  }

  public getByName(name: string): Country | undefined | null {
    if (this.records.size === 0) {
      return undefined;
    }
    if (this.name2id.index.has(name)) {
      return this.get(this.name2id.index.get(name)!)!;
    }
    return null;
  }

  async fetchAll(): Promise<void> {
    if (this.refetch || this.records.size === 0) {
      await this.fetch({});
    }
  }

  public deserialize(obj: any): Country {
    return {
      id: this.ns.MR.getID(obj.uri),
      uri: obj.uri,
      name: obj.name,
    };
  }

  protected normRemoteSuccessfulResponse(resp: any): FetchResponse {
    return { items: resp.data, total: resp.data.length };
  }
}
