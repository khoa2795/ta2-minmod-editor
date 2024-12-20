import { Flex } from "antd";
import { observer } from "mobx-react-lite";
import { SearchBar, useSearchArgs } from "./SearchBar";
import { DedupMineralSiteTable } from "./DedupMineralSiteTable";

export const EditorPage = observer(() => {
  const [searchArgs, normSearchArgs, setSearchArgs] = useSearchArgs();

  return (
    <Flex vertical={true} gap="small">
      <SearchBar searchArgs={searchArgs} setSearchArgs={setSearchArgs} />
      <DedupMineralSiteTable commodity={normSearchArgs.commodity} />
    </Flex>
  );
});
