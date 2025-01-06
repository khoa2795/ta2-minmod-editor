import { RStore, FetchResponse, SingleKeyUniqueIndex } from "gena-app";
import { SERVER } from "env";
import { InternalID } from "models/typing";

export interface DepositType {
  id: InternalID; // it is the URI
  uri: string;
  name: string;
  environment: string;
  group: string;
}

export class DepositTypeStore extends RStore<InternalID, DepositType> {
  constructor() {
    super(`${SERVER}/api/v1/deposit-types`, undefined, false, [new SingleKeyUniqueIndex("name", "id"), new SingleKeyUniqueIndex("uri", "id")]);
  }

  get name2id() {
    return this.indices[0] as SingleKeyUniqueIndex<string, string, DepositType>;
  }

  get uri2id() {
    return this.indices[1] as SingleKeyUniqueIndex<string, string, DepositType>;
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
      id: obj.uri,
    };
  }

  protected normRemoteSuccessfulResponse(resp: any): FetchResponse {
    return { items: resp.data, total: resp.data.length };
  }
}
