import { Commodity } from "../models/Commodity";

export class CommodityStore {
  protected remoteURL: string = "/commodities";
  protected commodities: Commodity[] = [];
  protected name2commodity: { [name: string]: Commodity } = {};
  protected uri2commodity: { [uri: string]: Commodity } = {};
  protected lastFetch?: number = undefined;

  public async fetchAll(): Promise<Commodity[]> {
    if (this.lastFetch === undefined) {
      const resp = await fetch(`${this.remoteURL}`);
      this.commodities = (await resp.json()).map((obj: any) => Commodity.deserialize(obj)).sort((a: Commodity, b: Commodity) => a.name.localeCompare(b.name));
      // TODO: fix me, this is a hack to make the search case-insensitive
      // leveraging that the lower-case version of the name is unique
      this.name2commodity = Object.fromEntries(this.commodities.map((comm: Commodity) => [comm.name.toLowerCase(), comm]));
      this.uri2commodity = Object.fromEntries(this.commodities.map((comm: Commodity) => [comm.uri, comm]));
      this.lastFetch = Date.now();
    }
    return Object.values(this.commodities);
  }

  public hasFetch(): boolean {
    return this.lastFetch !== undefined;
  }

  public getCommodityByURI(uri: string): Commodity | undefined {
    if (!this.hasFetch()) {
      throw new Error(`CommodityStore.getCommodityByURI: commodities not fetched`);
    }
    return this.uri2commodity[uri];
  }

  public getCommodityByName(name: string): Commodity | undefined {
    if (!this.hasFetch()) {
      throw new Error(`CommodityStore.getCommodityByName: commodities not fetched`);
    }
    // TODO: fix me, this is a hack to make the search case-insensitive
    // leveraging that the lower-case version of the name
    return this.name2commodity[name.toLowerCase()];
  }
}

export const commodityStore = new CommodityStore();
