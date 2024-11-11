import React, { createContext } from "react";
import { message } from "antd";
import { registerDefaultAxiosErrorHandler } from "gena-app";

import { toJS } from "mobx";
import { User, UserStore } from "./user";
import { Commodity, CommodityStore } from "./commodity";
import { DepositType, DepositTypeStore } from "./depositType";
import { DedupMineralSite, DedupMineralSiteStore } from "./dedupMineralSite";
import { Reference, Document, GradeTonnage, CandidateEntity, DraftCreateMineralSite, DraftUpdateMineralSite, MineralSite, MineralSiteStore } from "./mineralSite";

export const stores = {
  userStore: new UserStore(),
  commodityStore: new CommodityStore(),
  dedupMineralSiteStore: new DedupMineralSiteStore(),
  mineralSiteStore: new MineralSiteStore(),
  depositTypeStore: new DepositTypeStore(),
};

registerDefaultAxiosErrorHandler((error) => {
  message.error("Error while talking with the server.", 5);
});

(window as any)._stores = stores;
(window as any).toJS = toJS;
export type IStore = Readonly<typeof stores>;

/** Init the stores with essential information (e.g., loading the ui settings) needed to run the app */
export function initStores(): Promise<any> {
  return Promise.resolve();
}

export function initNonCriticalStores(): Promise<any> {
  return stores.depositTypeStore.fetchAll();
}

export const StoreContext = createContext<IStore>(stores);

export function useStores(): IStore {
  return React.useContext(StoreContext);
}

export { Document, DedupMineralSite, MineralSite, Reference, GradeTonnage, CandidateEntity, DraftCreateMineralSite, DraftUpdateMineralSite };
export type { Commodity, User };
