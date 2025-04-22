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
      const allUsernames = Array.from(new Set(sites.flatMap(extractUsernamesFromDedupSite)));
      userStore.fetchSiteCreatedUser(allUsernames);
    }
  }, [sites.length]);

  const allFormattedList = useMemo(() => {
    return sites.map((site) => getFormattedDedupmineralsite(site, userStore.getUsernames()));
  }, [sites, userStore.records.size]);
  return allFormattedList;
}
