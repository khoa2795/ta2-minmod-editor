import { Avatar, Button, Col, Flex, List, Row, Space, Typography } from "antd";
import { observer } from "mobx-react";
import React, { useEffect, useState } from "react";
import { InternalLink } from "gena-app";
import { Commodity, useStores } from "../../models";
import { routes } from "../../routes";
import { SearchBar, useSearchArgs } from "./SearchBar";
import { DedupMineralSiteTable } from "./DedupMineralSiteTable";

export const HomePage = observer(() => {
  const [searchArgs, normSearchArgs, setSearchArgs] = useSearchArgs();

  return (
    <Flex vertical={true} gap="small">
      <SearchBar searchArgs={searchArgs} setSearchArgs={setSearchArgs} />

      <DedupMineralSiteTable commodity={normSearchArgs.commodity} />
    </Flex>
  );
});
