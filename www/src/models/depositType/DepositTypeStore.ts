import { RStore, FetchResponse, SingleKeyUniqueIndex } from "gena-app";
import { SERVER } from "env";
import { InternalID, IRI } from "models/typing";
import { NamespaceManager } from "models/Namespace";

export interface DepositType {
  id: InternalID;
  uri: IRI;
  name: string;
  environment: string;
  group: string;
}

export class DepositTypeStore extends RStore<InternalID, DepositType> {
  ns: NamespaceManager;

  constructor(ns: NamespaceManager) {
    super(`${SERVER}/api/v1/deposit-types`, undefined, false, [new SingleKeyUniqueIndex("name", "id"), new SingleKeyUniqueIndex("uri", "id")]);
    this.ns = ns;
  }

  get name2id() {
    return this.indices[0] as SingleKeyUniqueIndex<string, InternalID, DepositType>;
  }

  get uri2id() {
    return this.indices[1] as SingleKeyUniqueIndex<IRI, InternalID, DepositType>;
  }

  public getByName(name: string): DepositType | undefined {
    let id = this.name2id.index.get(name);
    return id === undefined ? undefined : this.records.get(id)!;
  }

  public getByURI(uri: string): DepositType | undefined {
    let id = this.uri2id.index.get(uri);
    return id === undefined ? undefined : this.records.get(id)!;
  }

  async fetchAll(): Promise<void> {
    if (this.refetch || this.records.size === 0) {
      await this.fetch({});
    }
  }

  public deserialize(obj: any): DepositType {
    return {
      ...obj,
      id: this.ns.MR.getID(obj.uri),
    };
  }

  protected normRemoteSuccessfulResponse(resp: any): FetchResponse {
    return { items: resp.data, total: resp.data.length };
  }
}
