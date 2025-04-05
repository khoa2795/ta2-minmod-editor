import { makeAutoObservable } from "mobx";

export type DisplayField = "geology_info" | "discover_year" | "mineral_form";

export class SettingStore {
  displayColumns: Set<DisplayField> = new Set();
  isModalVisible: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  setDisplayColumns(fields: DisplayField[]) {
    this.displayColumns = new Set(fields);
  }

  resetFields() {
    this.displayColumns.clear();
  }

  showSetting() {
    this.isModalVisible = true;
  }

  hideSetting() {
    this.isModalVisible = false;
  }
}
