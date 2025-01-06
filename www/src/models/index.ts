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
import { FieldEdit, EditableField, Reference, Document, GradeTonnage, CandidateEntity, DraftCreateMineralSite, DraftUpdateMineralSite, MineralSite, MineralSiteStore } from "./mineralSite";
import { NamespaceManager, BindedNamespace } from "./Namespace";
import { Source, SourceStore } from "./source";
import { Unit, UnitStore } from "./units";

const namespaceManager = new NamespaceManager();
const dedupMineralSiteStore = new DedupMineralSiteStore(namespaceManager);

export const stores = {
  userStore: new UserStore(),
  commodityStore: new CommodityStore(),
  dedupMineralSiteStore,
  mineralSiteStore: new MineralSiteStore(dedupMineralSiteStore),
  depositTypeStore: new DepositTypeStore(),
  stateOrProvinceStore: new StateOrProvinceStore(),
  countryStore: new CountryStore(),
  sourceStore: new SourceStore(),
  unitStore: new UnitStore(),
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
  return Promise.all([stores.depositTypeStore.fetchAll(), stores.countryStore.fetchAll(), stores.stateOrProvinceStore.fetchAll(), stores.sourceStore.fetchAll(), stores.unitStore.fetchAll()]);
}

export const StoreContext = createContext<IStore>(stores);

export function useStores(): IStore {
  return React.useContext(StoreContext);
}

export { Document, DedupMineralSite, MineralSite, Reference, GradeTonnage, CandidateEntity, DraftCreateMineralSite, DraftUpdateMineralSite, BindedNamespace, NamespaceManager };
export type { FieldEdit, EditableField, Commodity, User, DepositType, Country, StateOrProvince, Unit };
