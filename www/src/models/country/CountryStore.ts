import { RStore, FetchResponse } from "gena-app";
import { SERVER } from "env";
import { IRI } from "models/typing";

export interface Country {
  id: IRI; // it is the URI
  uri: IRI;
  name: string;
}

export class CountryStore extends RStore<string, Country> {
  constructor() {
    super(`${SERVER}/api/v1/countries`, undefined, false);
  }

  public getByURI(uri: string): Country | undefined {
    const country = this.records.get(uri);
    if (country === null) return undefined;
    return country;
  }

  async fetchAll(): Promise<void> {
    if (this.refetch || this.records.size === 0) {
      await this.fetch({});
    }
  }

  public deserialize(obj: any): Country {
    return {
      id: obj.uri,
      uri: obj.uri,
      name: obj.name,
    };
  }

  protected normRemoteSuccessfulResponse(resp: any): FetchResponse {
    return { items: resp.data, total: resp.total };
  }
}
