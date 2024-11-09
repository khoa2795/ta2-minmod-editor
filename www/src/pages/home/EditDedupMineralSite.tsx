import { Select, Space, Typography } from "antd";
import { observer } from "mobx-react";
import { useStores, Commodity, DedupMineralSite } from "models";
import { useEffect, useState } from "react";

interface EditDedupMineralSiteProps {
  dedupSite: DedupMineralSite;
}

export const EditDedupMineralSite: React.FC<EditDedupMineralSiteProps> = observer(({ dedupSite }) => {
  return <span>NotImplemented</span>;
});
