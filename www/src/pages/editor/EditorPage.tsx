import { Button, Flex } from "antd";
import { observer } from "mobx-react-lite";
import { SearchBar, useSearchArgs } from "./SearchBar";
import { DedupMineralSiteTable } from "./DedupMineralSiteTable";
import { useRef } from "react";
import { NewMineralSiteModal, NewMineralSiteFormRef } from "./NewMineralSiteModal";

export const EditorPage = observer(() => {
  const [searchArgs, normSearchArgs, setSearchArgs] = useSearchArgs();
  const newMineralSiteFormRef = useRef<NewMineralSiteFormRef>(null);
  const handleOpenNewMineralSiteForm = () => {
    if (newMineralSiteFormRef.current != null || newMineralSiteFormRef.current != undefined) {
      newMineralSiteFormRef.current.open();
    }
  };
  return (
    <Flex vertical={true} gap="small">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <SearchBar searchArgs={searchArgs} setSearchArgs={setSearchArgs} />
        <Button type="primary" onClick={handleOpenNewMineralSiteForm}>
          Add Mineral Site
        </Button>
      </div>
      <DedupMineralSiteTable commodity={normSearchArgs.commodity} />
      <NewMineralSiteModal
        ref={newMineralSiteFormRef}
        commodity={normSearchArgs.commodity}
      />
    </Flex>
  );
});