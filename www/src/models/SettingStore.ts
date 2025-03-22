import { makeAutoObservable } from "mobx";
export class SettingStore {
  addField: string[] = [];

  constructor() {
    makeAutoObservable(this); 
  }

  setAddField(fields: string[]) {
    this.addField = fields;
  }

  hasGeologyInfo() {
    return this.addField.includes("geology_info");
  }

  hasDiscoverYear() {
    return this.addField.includes("discover_year");
  }

  hasMineralForm() {
    return this.addField.includes("mineral_form");
  }
  resetFields() {
    this.addField = [];
  }
}
