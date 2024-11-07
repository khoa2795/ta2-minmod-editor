import { MineralSite } from "../models/MineralSite";

export class MineralSiteStore {
  protected remoteURL: string = "/mineral-sites";

  public async getById(id: string): Promise<MineralSite> {
    const resp = await fetch(`${this.remoteURL}/${id}`);
    return MineralSite.deserialize(id, await resp.json());
  }

  public async getByURI(uri: string): Promise<MineralSite> {
    const id = uri.split("resource/")[1];
    return this.getById(id);
  }

  public async getByURIs(uris: string[]): Promise<MineralSite[]> {
    return Promise.all(uris.map(this.getByURI));
  }

  public async createMineralSite(ms: MineralSite): Promise<1> {
    return 1;
  }
}

export const mineralSiteStore = new MineralSiteStore();
