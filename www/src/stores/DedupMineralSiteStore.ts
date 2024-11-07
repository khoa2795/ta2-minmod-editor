import { DedupMineralSite } from "../models/DedupMineralSite";

export class DedupMineralSiteStore {
  protected remoteURL: string = "/dedup-mineral-sites";

  public async findByCommodity(commodity: string): Promise<DedupMineralSite[]> {
    const resp = await fetch(`${this.remoteURL}/${commodity}`);
    return (await resp.json()).map((obj: any) => DedupMineralSite.deserialize(obj));
  }
}

export const dedupMineralSiteStore = new DedupMineralSiteStore();
