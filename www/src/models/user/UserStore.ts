import { RStore } from "gena-app";
import { SERVER } from "../../env";
import { runInAction } from "mobx";
import axios from "axios";

export interface User {
  id: string;
  email: string;
  name: string;
}

export class UserStore extends RStore<string, User> {
  constructor() {
    super(`${SERVER}/api/v1`, { id: "username" }, false);
  }

  async login(username: string, password: string) {
    let resp = await axios.post(`${SERVER}/api/v1/login`, { username, password });
    return runInAction(() => {
      this.set(this.deserialize(resp.data));
    });
  }

  async isLoggedIn(): Promise<boolean> {
    if (this.records.size > 0) {
      return true;
    }

    try {
      let resp = await axios.get(`${SERVER}/api/v1/whoami`);
      runInAction(() => {
        this.set(this.deserialize(resp.data));
      });
      return true;
    } catch (err) {
      return false;
    }
  }
}
