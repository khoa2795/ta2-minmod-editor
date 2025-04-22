import { RStore } from "gena-app";
import { SERVER } from "env";
import { action, makeObservable, runInAction } from "mobx";
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
    makeObservable(this, {
      fetchSiteCreatedUser: action,
    });
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
  
  async fetchSiteCreatedUser(siteIds: string[]): Promise<void> {
    try {
      const response = await axios.post(`${SERVER}/api/v1/users/find_by_ids`, { user_uris: siteIds });
      const allUsers: Record<string, any> = response.data;

      runInAction(() => {
        for (const user of Object.values(allUsers)) {
          if (user.role === "user") {
            this.set(this.deserialize(user));
          }
        }
      });
    } catch (err) {
      console.error("Fail to get user");
    }
  }

  public getUsernames(): string[] {
    return Array.from(this.records.values())
      .filter((user): user is User => user !== null && user !== undefined)
      .map((user) => user.id);
  }
}
