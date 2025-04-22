import { useStores } from "models";
import { DedupMineralSite } from "models/dedupMineralSite/DedupMineralSite";
import { useEffect, useMemo } from "react";

export class FormattedDedupMineralSite {
  origin: DedupMineralSite;
  isEdited: boolean;

  public constructor(origin: DedupMineralSite, isEdited: boolean = false) {
    this.origin = origin;
    this.isEdited = isEdited;
  }
}

export const extractUsernamesFromDedupSite = (dedupSite: DedupMineralSite): string[] => {
  return dedupSite.sites
    .map((site) => {
      const parts = site.id?.split("__");
      return parts && parts.length > 1 ? parts[parts.length - 1] : undefined;
    })
    .filter((username): username is string => Boolean(username));
};

export function getFormattedDedupmineralsite(site: DedupMineralSite, currentUsernames: string[]): FormattedDedupMineralSite {
  const siteUsernames = extractUsernamesFromDedupSite(site);
  const isEdited = siteUsernames.some((username) => currentUsernames.includes(username));
  return new FormattedDedupMineralSite(site, isEdited);
}

export function useFormattedDedupMineralSite(sites: DedupMineralSite[]): FormattedDedupMineralSite[] {
  const { userStore } = useStores();

  useEffect(() => {
    if (sites.length > 0) {
      const usernames = Array.from(new Set(sites.flatMap(extractUsernamesFromDedupSite)));
      userStore.fetchByIds(usernames).catch((error) => {
        console.error("Not find any other users except current user.", error);
      });
    }
  }, [sites]);

  const allFormattedList = useMemo(() => {
    const usernames = Array.from(new Set(sites.flatMap(extractUsernamesFromDedupSite))).filter((username) => {
      const user = userStore.get(username);
      return user !== undefined && user !== null && user.role === "user";
    });
    return sites.map((site) => getFormattedDedupmineralsite(site, usernames));
  }, [sites, userStore.records.size]);
  return allFormattedList;
}
