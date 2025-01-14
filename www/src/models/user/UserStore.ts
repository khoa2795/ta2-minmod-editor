import { RStore } from "gena-app";
import { SERVER } from "env";
import { runInAction } from "mobx";
import axios from "axios";

export interface User {
  id: string;
  url: string;
  email: string;
  name: string;
}

export class UserStore extends RStore<string, User> {
  constructor() {
    super(`${SERVER}/api/v1`, { id: "username" }, false);
  }

  async login(username: string, password: string) {
    let resp = await axios.post(`${SERVER}/api/v1/login`, { username, password });
    runInAction(() => {
      this.set(this.deserialize(resp.data));
    });
  }

  async isLoggedIn(): Promise<boolean> {
    if (this.records.size > 0) {
      return true;
    }

    try {
      const resp = await axios.get(`${SERVER}/api/v1/whoami`);
      runInAction(() => {
        this.set(this.deserialize(resp.data));
      });
      return true;
    } catch (err) {
      return false;
    }
  }
  public getCurrentUser(): User | undefined {
    if (this.records.size === 0) return undefined;
    return this.records.values().next().value || undefined;
  }

  public deserialize(obj: any): User {
    return {
      id: obj.username,
      email: obj.email,
      name: obj.name,
      url: obj.uri,
    };
  }

  async logout() {
    const allCookies = document.cookie.split(";");
    for (let i = 0; i < allCookies.length; i++) {
      const cookie = allCookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }
    runInAction(() => {
      this.records.clear();
    });
  }
}
