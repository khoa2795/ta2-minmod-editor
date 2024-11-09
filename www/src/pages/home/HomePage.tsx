import { Avatar, Button, Col, Flex, List, Row, Space, Typography } from "antd";
import { observer } from "mobx-react";
import React, { useEffect, useState } from "react";
import { InternalLink } from "gena-app";
import { Commodity, useStores } from "../../models";
import { routes } from "../../routes";
import { SearchBar } from "./SearchBar";
import { DedupMineralSiteTable } from "./DedupMineralSiteTable";

export const HomePage = observer(() => {
  const [selectedCommodity, setSelectedCommodity] = useState<Commodity | undefined>(undefined);

  return (
    <Flex vertical={true} gap="small">
      <SearchBar onSearch={({ commodity }) => setSelectedCommodity(commodity)} />

      <DedupMineralSiteTable commodity={selectedCommodity} />
    </Flex>
  );
});
