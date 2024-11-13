import React, { createContext } from "react";
import { message } from "antd";
import { registerDefaultAxiosErrorHandler } from "gena-app";

import { toJS } from "mobx";
import { User, UserStore } from "./user";
import { Commodity, CommodityStore } from "./commodity";
import { DepositType, DepositTypeStore } from "./depositType";
import { Country, CountryStore } from "./country";
import { StateOrProvince, StateOrProvinceStore } from "./stateOrProvince";
import { DedupMineralSite, DedupMineralSiteStore } from "./dedupMineralSite";
import { EditableField, Reference, Document, GradeTonnage, CandidateEntity, DraftCreateMineralSite, DraftUpdateMineralSite, MineralSite, MineralSiteStore } from "./mineralSite";

const dedupMineralSiteStore = new DedupMineralSiteStore();

export const stores = {
  userStore: new UserStore(),
  commodityStore: new CommodityStore(),
  dedupMineralSiteStore,
  mineralSiteStore: new MineralSiteStore(dedupMineralSiteStore),
  depositTypeStore: new DepositTypeStore(),
  stateOrProvinceStore: new StateOrProvinceStore(),
  countryStore: new CountryStore(),
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
  return Promise.all([stores.depositTypeStore.fetchAll(), stores.countryStore.fetchAll(), stores.stateOrProvinceStore.fetchAll()]);
}

export const StoreContext = createContext<IStore>(stores);

export function useStores(): IStore {
  return React.useContext(StoreContext);
}

export { Document, DedupMineralSite, MineralSite, Reference, GradeTonnage, CandidateEntity, DraftCreateMineralSite, DraftUpdateMineralSite };
export type { EditableField, Commodity, User, DepositType, Country, StateOrProvince };
