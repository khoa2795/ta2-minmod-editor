import { Button, Flex, Space, Table, Typography, message, Checkbox } from "antd";
import { observer } from "mobx-react-lite";
import { useStores, Commodity, DedupMineralSite, MineralSite, Reference, DraftCreateMineralSite, FieldEdit, EditableField, DraftUpdateMineralSite } from "models";
import { useEffect, useMemo, useState } from "react";
import { CanEntComponent, ListCanEntComponent } from "./CandidateEntity";
import { join } from "misc";
import { EditOutlined } from "@ant-design/icons";
import { EditSiteField } from "./EditSiteField";
import styles from "./EditDedupMineralSite.module.css";
import { Tooltip, Avatar } from "antd";
import axios from "axios";
import ReferenceComponent from "components/ReferenceComponent";
import { SourceStore } from "../../../models/source"
const getUserColor = (username: string) => {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  const hue = Math.abs(hash % 360);
  const saturation = 70;
  const lightness = 50;

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

interface EditDedupMineralSiteProps {
  commodity: Commodity;
  dedupSite: DedupMineralSite;
}

export const EditDedupMineralSite = observer(({ dedupSite, commodity }: EditDedupMineralSiteProps) => {
  const stores = useStores();
  const { mineralSiteStore, userStore, dedupMineralSiteStore } = stores;
  const [editField, setEditField] = useState<EditableField | undefined>(undefined);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const tmpLst: (MineralSite | null | undefined)[] = dedupSite.sites.map((site) => mineralSiteStore.get(site.id));
  // no idea why typescript compiler incorrectly complains about the incorrect type
  const fetchedSites = tmpLst.filter((site) => site !== undefined) as (MineralSite | null)[];
  const sites = fetchedSites.filter((site) => site !== null) as MineralSite[];
  const isLoading = mineralSiteStore.state.value === "updating" || fetchedSites.length !== dedupSite.sites.length;

  const ungroupTogether = async () => {
    const selectedSiteIds = Array.from(selectedRows);
    const allSiteIds = sites.map((site) => site.id);
    const unselectedSiteIds = allSiteIds.filter((id) => !selectedRows.has(id));

    const newGroups = [{ sites: selectedSiteIds }, { sites: unselectedSiteIds }];
    const newIds = await dedupMineralSiteStore.updateSameAsGroup(newGroups);

    if (commodity && commodity.id) {
      const commodityId = commodity.id;
      await dedupMineralSiteStore.replaceSites([dedupSite.id], newIds, commodityId);
      message.success("Ungrouping was successful!");
    }
  };

  const ungroupSeparately = async () => {
    const selectedSiteIds = Array.from(selectedRows);
    const allSiteIds = sites.map((site) => site.id);
    const unselectedSiteIds = allSiteIds.filter((id) => !selectedRows.has(id));

    const selectedPayload = selectedSiteIds.map((id) => ({ sites: [id] }));
    const unselectedPayload = unselectedSiteIds.length > 0 ? [{ sites: unselectedSiteIds }] : [];
    const createPayload = [...selectedPayload, ...unselectedPayload];
    const newIds = await dedupMineralSiteStore.updateSameAsGroup(createPayload);

    if (commodity && commodity.id) {
      const commodityId = commodity.id;
      await dedupMineralSiteStore.replaceSites([dedupSite.id], newIds, commodityId);
      message.success("Ungrouping was successful!");
    }
  };

  const columns = useMemo(() => {
    return [
      {
        title: "User",
        key: "user",
        render: (_: any, site: MineralSite, index: number) => {
          let username;
          let fullName;

          if (site.createdBy[0]?.includes("/s/")) {
            username = "System";
            fullName = "System";
          } else {
            const createdBy = site.createdBy[0]?.split("/").pop() || "Unknown";
            username = createdBy;
            fullName = createdBy;
          }
          const allUsernamesTooltip =
            username === "System"
              ? site.createdBy
                .map((url, i) => {
                  const parts = url.split("/");
                  return parts[parts.length - 1];
                })
                .join(", ")
              : fullName;

          const color = getUserColor(username);
          const confidence = dedupSite.sites[index].score;

          return (
            <Flex align="center" gap={8}>
              <Tooltip title={allUsernamesTooltip}>
                <Avatar style={{ backgroundColor: color, verticalAlign: "middle" }}>{username[0].toUpperCase()}</Avatar>
              </Tooltip>
              <Tooltip title={`Confidence: ${confidence}`}>
                <Avatar>{confidence}</Avatar>
              </Tooltip>
            </Flex>
          );
        },
      },

      {
        title: "Select",
        key: "select",
        hidden: sites.length === 1,
        render: (_: any, site: MineralSite) => (
          <Checkbox
            checked={selectedRows.has(site.id)}
            onChange={(e) => {
              const updatedRows = new Set(selectedRows);
              if (e.target.checked) {
                updatedRows.add(site.id);
              } else {
                updatedRows.delete(site.id);
              }
              setSelectedRows(updatedRows);
            }}
          />
        ),
      },
      {
        title: (
          <Flex justify="space-between">
            <span>Name</span>
            <EditOutlined className={styles.editButton} onClick={() => setEditField("name")} />
          </Flex>
        ),
        key: "name",
        render: (_: any, site: MineralSite) => {
          return (
            <Typography.Link href={site.uri} target="_blank">
              {site.name}
            </Typography.Link>
          );
        },
      },
      {
        title: (
          <Flex justify="space-between">
            <span>Location</span>
            <EditOutlined className={styles.editButton} onClick={() => setEditField("location")} />
          </Flex>
        ),
        key: "location",
        render: (_: any, site: MineralSite) => {
          return (
            <Typography.Text className="font-small" ellipsis={true} style={{ maxWidth: 200 }}>
              {site.locationInfo.location}
            </Typography.Text>
          );
        },
      },
      {
        title: "CRS",
        key: "crs",
        render: (_: any, site: MineralSite) => {
          return <span>{site.locationInfo.crs?.observedName}</span>;
        },
      },
      {
        title: (
          <Flex justify="space-between">
            <span>Country</span>
            <EditOutlined className={styles.editButton} onClick={() => setEditField("country")} />
          </Flex>
        ),
        key: "country",
        render: (_: any, site: MineralSite) => {
          return <ListCanEntComponent entities={site.locationInfo.country} store="countryStore" />;
        },
      },
      {
        title: (
          <Flex justify="space-between">
            <span>State/Province</span>
            <EditOutlined className={styles.editButton} onClick={() => setEditField("stateOrProvince")} />
          </Flex>
        ),
        key: "state/province",
        render: (_: any, site: MineralSite) => {
          return <ListCanEntComponent entities={site.locationInfo.stateOrProvince} store="stateOrProvinceStore" />;
        },
      },
      {
        title: (
          <Flex justify="space-between">
            <span>Dep. Type</span>
            <EditOutlined className={styles.editButton} onClick={() => setEditField("depositType")} />
          </Flex>
        ),
        key: "deposit-type",
        render: (_: any, site: MineralSite) => {
          return <CanEntComponent entity={site.depositTypeCandidate[0]} store="depositTypeStore" />;
        },
      },
      {
        title: "Dep. Confidence",
        key: "dep-type-confidence",
        render: (_: any, site: MineralSite) => {
          if (site.depositTypeCandidate.length === 0) {
            return "-";
          }
          return site.depositTypeCandidate[0].confidence.toFixed(4);
        },
      },
      {
        title: (
          <Flex justify="space-between">
            <span>Tonnage (Mt)</span>
            <EditOutlined className={styles.editButton} onClick={() => setEditField("tonnage")} />
          </Flex>
        ),
        key: "tonnage",
        render: (_: any, site: MineralSite) => {
          const gradeTonnage = site.gradeTonnage[commodity.id];
          if (gradeTonnage === undefined || gradeTonnage.totalTonnage === undefined) {
            return "-";
          }
          return gradeTonnage.totalTonnage.toFixed(4);
        },
      },
      {
        title: (
          <Flex justify="space-between">
            <span>Grade (%)</span>
            <EditOutlined className={styles.editButton} onClick={() => setEditField("grade")} />
          </Flex>
        ),
        key: "grade",
        render: (_: any, site: MineralSite) => {
          const gradeTonnage = site.gradeTonnage[commodity.id];
          if (gradeTonnage === undefined || gradeTonnage.totalGrade === undefined) {
            return "-";
          }
          return gradeTonnage.totalGrade.toFixed(2);
        },
      },
      {
        title: "Source",
        key: "reference",
        render: (_: any, site: MineralSite) => (
          <ReferenceComponent site={site} sourceStore={stores.sourceStore} />
        ),
      }
    ];
  }, [commodity.id, sites.length, selectedRows, ungroupTogether]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        mineralSiteStore.fetchByIds(dedupSite.sites.map((site) => site.id));
      } catch (error) {
        console.error("Error in fetchData:", error);
      }
    };

    fetchData();
  }, [dedupSite.sites, mineralSiteStore]);

  const onEditFinish = (change?: { edit: FieldEdit; reference: Reference }) => {
    if (change === undefined) {
      setEditField(undefined);
      return;
    }

    const currentUser = userStore.getCurrentUser()!;
    const existingSite = sites.find((site) => site.createdBy.includes(currentUser.url));
    let cb;
    if (existingSite === undefined) {
      const draftSite = DraftCreateMineralSite.fromMineralSite(stores, dedupSite, sites, currentUser, change.reference);
      draftSite.updateField(stores, change.edit, change.reference);
      cb = mineralSiteStore.createAndUpdateDedup(dedupSite.commodity, draftSite);
    } else {
      const draftSite = new DraftUpdateMineralSite(existingSite);
      draftSite.updateField(stores, change.edit, change.reference);
      cb = mineralSiteStore.updateAndUpdateDedup(dedupSite.commodity, draftSite);
    }

    cb.then(() => {
      setEditField(undefined);
    });
  };

  const currentSite = sites.find((site) => site.createdBy.includes(userStore.getCurrentUser()!.url));

  let groupBtns = undefined;
  if (selectedRows.size > 0 && sites.length > 1) {
    const ungrpSepBtn = (
      <Button key="separately" type="primary" onClick={ungroupSeparately}>
        Ungroup Separately
      </Button>
    );
    const ungrpTogBtn = (
      <Button key="together" type="primary" onClick={ungroupTogether}>
        Ungroup Together
      </Button>
    );
    if (selectedRows.size === 1 || selectedRows.size === sites.length) {
      groupBtns = [ungrpSepBtn];
    } else {
      groupBtns = [ungrpSepBtn, ungrpTogBtn];
    }
    groupBtns = <Space>{groupBtns}</Space>;
  }

  return (
    <Flex vertical={true} gap="small">
      {groupBtns}
      <Table<MineralSite>
        className={styles.table}
        bordered={true}
        pagination={false}
        size="small"
        rowKey="id"
        columns={columns}
        dataSource={sites}
        loading={isLoading}
        rowClassName={(site) => {
          return site.createdBy.includes(userStore.getCurrentUser()!.url) ? styles.myEditedRow : "";
        }}
      />
      <EditSiteField key={editField} sites={sites} currentSite={currentSite} editField={editField} onFinish={onEditFinish} commodity={commodity.id} />
    </Flex>
  );
}) as React.FC<EditDedupMineralSiteProps>;

