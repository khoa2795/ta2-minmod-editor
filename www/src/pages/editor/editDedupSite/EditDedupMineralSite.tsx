import { Button, Flex, Space, Table, Typography, message, Checkbox, Tag, Descriptions } from "antd";
import { observer } from "mobx-react-lite";
import { useStores, Commodity, DedupMineralSite, MineralSite, Reference, DraftCreateMineralSite, FieldEdit, EditableField, DraftUpdateMineralSite } from "models";
import { useEffect, useMemo, useState } from "react";
import { CanEntComponent, ListCanEntComponent } from "./CandidateEntity";
import { EditOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { EditSiteField } from "./EditSiteField";
import styles from "./EditDedupMineralSite.module.css";
import { Tooltip } from "antd";
import { ReferenceComponent } from "pages/editor/editDedupSite/ReferenceComponent";
import { InternalID } from "models/typing";
import { Empty, Grade, MayEmptyString, Tonnage } from "components/Primitive";

const colors = ["magenta", "red", "volcano", "orange", "gold", "lime", "green", "cyan", "blue", "geekblue", "purple"];
const getUserColor = (username: string) => {
  let hash = 1;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  return colors[hash % colors.length];
};

interface EditDedupMineralSiteProps {
  commodity: Commodity;
  dedupSite: DedupMineralSite;
}

class GroupedSites {
  nGroups: number;
  sites: MineralSite[];
  groups: { [grpKey: string]: { sites: MineralSite[]; label: string } };
  site2groupKey: { [siteId: InternalID]: string };

  constructor(sites: MineralSite[]) {
    this.sites = sites;
    this.groups = {};
    this.site2groupKey = {};
    this.nGroups = 0;

    for (const ms of sites) {
      const key = `${ms.sourceId}--${ms.recordId}`;
      if (this.groups[key] === undefined) {
        this.nGroups += 1;
        this.groups[key] = { sites: [], label: `s${this.nGroups}` };
      }
      this.groups[key].sites.push(ms);
      this.site2groupKey[ms.id] = key;
    }
  }
}

class SelectedSites {
  groups: Set<string>;

  constructor() {
    this.groups = new Set();
  }

  clone(): SelectedSites {
    const ret = new SelectedSites();
    ret.groups = new Set(this.groups);
    return ret;
  }

  has(id: InternalID, siteGroups: GroupedSites): boolean {
    return this.groups.has(siteGroups.site2groupKey[id]);
  }

  add(siteId: InternalID, siteGroups: GroupedSites): SelectedSites {
    const other = this.clone();
    other.groups.add(siteGroups.site2groupKey[siteId]);
    return other;
  }

  delete(siteId: InternalID, siteGroups: GroupedSites): SelectedSites {
    const other = this.clone();
    other.groups.delete(siteGroups.site2groupKey[siteId]);
    return other;
  }
}

export const EditDedupMineralSite = observer(({ dedupSite, commodity }: EditDedupMineralSiteProps) => {
  const stores = useStores();
  const { mineralSiteStore, userStore, dedupMineralSiteStore, settingStore } = stores;
  const user = userStore.getCurrentUser()!;

  const [editField, setEditField] = useState<EditableField | undefined>(undefined);
  const [selectedRows, setSelectedRows] = useState<SelectedSites>(new SelectedSites());
  const [expandedRowKeys, setExpandedRowKeys] = useState<Set<InternalID>>(new Set());

  const [fetchedSites, siteGroups] = useMemo(() => {
    const tmpLst: (MineralSite | null | undefined)[] = dedupSite.sites.map((site) => mineralSiteStore.get(site.id));
    // no idea why typescript compiler incorrectly complains about the incorrect type
    const fetchedSites = tmpLst.filter((site) => site !== undefined) as (MineralSite | null)[];
    const sites = fetchedSites.filter((site) => site !== null) as MineralSite[];

    return [fetchedSites, new GroupedSites(sites)];
  }, [dedupSite.sites, mineralSiteStore.records.size]);
  const isLoading = mineralSiteStore.state.value === "updating" || fetchedSites.length !== dedupSite.sites.length;

  const ungroupTogether = async () => {
    const ungroupPayload = [
      {
        sites: Array.from(selectedRows.groups).flatMap((grpKey) => {
          return siteGroups.groups[grpKey].sites.map((site) => site.id);
        }),
      },
    ];

    const remainGroup = Object.keys(siteGroups.groups)
      .filter((grpKey) => !selectedRows.groups.has(grpKey))
      .flatMap((grpKey) => siteGroups.groups[grpKey].sites.map((site) => site.id));
    if (remainGroup.length > 0) {
      ungroupPayload.push({ sites: remainGroup });
    }

    const newIds = await dedupMineralSiteStore.updateSameAsGroup(ungroupPayload);
    if (commodity && commodity.id) {
      const commodityId = commodity.id;
      await dedupMineralSiteStore.replaceSites([dedupSite.id], newIds, commodityId);
      message.success("Ungrouping was successful!");
    }
  };

  const ungroupSeparately = async () => {
    const ungroupPayload = Array.from(selectedRows.groups).map((grpKey) => {
      return {
        sites: siteGroups.groups[grpKey].sites.map((site) => site.id),
      };
    });

    const remainGroup = Object.keys(siteGroups.groups)
      .filter((grpKey) => !selectedRows.groups.has(grpKey))
      .flatMap((grpKey) => siteGroups.groups[grpKey].sites.map((site) => site.id));
    if (remainGroup.length > 0) {
      ungroupPayload.push({ sites: remainGroup });
    }

    const newIds = await dedupMineralSiteStore.updateSameAsGroup(ungroupPayload);

    if (commodity && commodity.id) {
      const commodityId = commodity.id;
      await dedupMineralSiteStore.replaceSites([dedupSite.id], newIds, commodityId);
      message.success("Ungrouping was successful!");
    }
  };
  const columns = useMemo(() => {
    const defaultColumns = [
      {
        title: "",
        key: "select",
        hidden: siteGroups.sites.length === 1,
        render: (_: any, site: MineralSite) => (
          <Space size="small">
            <Checkbox
              checked={selectedRows.has(site.id, siteGroups)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedRows(selectedRows.add(site.id, siteGroups));
                } else {
                  setSelectedRows(selectedRows.delete(site.id, siteGroups));
                }
              }}
            />
            <button
              type="button"
              className={"ant-table-row-expand-icon " + (expandedRowKeys.has(site.id) ? "ant-table-row-expand-icon-expanded" : "ant-table-row-expand-icon-collapsed")}
              style={{ borderRadius: 4, borderColor: "#bbb", opacity: 0.8 }}
              onClick={() => {
                const newExpandedRowKeys = new Set(expandedRowKeys);
                if (newExpandedRowKeys.has(site.id)) {
                  newExpandedRowKeys.delete(site.id);
                } else {
                  newExpandedRowKeys.add(site.id);
                }
                setExpandedRowKeys(newExpandedRowKeys);
              }}
            />
          </Space>
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
        render: (_: any, site: MineralSite, index: number) => {
          const createdBy = site.createdBy.split("/").pop()!;
          const fullName = createdBy;
          const username = createdBy;

          const color = getUserColor(username);
          const confidence = dedupSite.sites[index].score;

          return (
            <Flex align="left" vertical={true} gap={4}>
              <Typography.Link href={`/resource/${site.id}`} target="_blank">
                {site.name || "␣"}
              </Typography.Link>
              <Space size={"small"}>
                <Tooltip title={fullName}>
                  <Tag color={color} style={{ margin: 0 }}>
                    {username}
                  </Tag>
                </Tooltip>
                <Tooltip title={`Confidence: ${confidence}`} style={{ textAlign: "center" }}>
                  <Tag>{confidence}</Tag>
                </Tooltip>
              </Space>
            </Flex>
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
              {site.locationInfo?.location}
            </Typography.Text>
          );
        },
      },
      {
        title: "CRS",
        key: "crs",
        render: (_: any, site: MineralSite) => {
          return <MayEmptyString value={site.locationInfo?.crs?.observedName} />;
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
          return <ListCanEntComponent entities={site.locationInfo?.country || []} store="countryStore" />;
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
          return <ListCanEntComponent entities={site.locationInfo?.stateOrProvince || []} store="stateOrProvinceStore" />;
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
            return <Empty />;
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
          return <Tonnage tonnage={site.gradeTonnage[commodity.id]?.totalTonnage} />;
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
          return <Grade grade={site.gradeTonnage[commodity.id]?.totalGrade} />;
        },
      },
    ];
    if (settingStore.displayColumns.has("geology_info")) {
      defaultColumns.push({
        title: "Alternation",
        key: "alternation",
        render: (_: any, site: MineralSite) => {
          return <MayEmptyString value={site.geologyInfo?.alternation} />;
        },
      });

      defaultColumns.push({
        title: "Concentration Process",
        key: "concentration-process",
        render: (_: any, site: MineralSite) => {
          return <MayEmptyString value={site.geologyInfo?.concentrationProcess} />;
        },
      });

      defaultColumns.push({
        title: "Ore Control",
        key: "ore-control",
        render: (_: any, site: MineralSite) => {
          return <MayEmptyString value={site.geologyInfo?.oreControl} />;
        },
      });

      defaultColumns.push({
        title: "Host Rock Unit",
        key: "host-rock-unit",
        render: (_: any, site: MineralSite) => {
          return <MayEmptyString value={site.geologyInfo?.hostRock?.unit} />;
        },
      });

      defaultColumns.push({
        title: "Host Rock Type",
        key: "host-rock-type",
        render: (_: any, site: MineralSite) => {
          return <MayEmptyString value={site.geologyInfo?.hostRock?.type} />;
        },
      });

      defaultColumns.push({
        title: "Structure",
        key: "structure",
        render: (_: any, site: MineralSite) => {
          return <MayEmptyString value={site.geologyInfo?.structure} />;
        },
      });

      defaultColumns.push({
        title: "Associated Rock Unit",
        key: "associated-rock-unit",
        render: (_: any, site: MineralSite) => {
          return <MayEmptyString value={site.geologyInfo?.associatedRock?.unit} />;
        },
      });

      defaultColumns.push({
        title: "Associated Rock Type",
        key: "associated-rock-type",
        render: (_: any, site: MineralSite) => {
          return <MayEmptyString value={site.geologyInfo?.associatedRock?.type} />;
        },
      });

      defaultColumns.push({
        title: "Tectonic",
        key: "tectonic",
        render: (_: any, site: MineralSite) => {
          return <MayEmptyString value={site.geologyInfo?.tectonic} />;
        },
      });
    }
    if (settingStore.displayColumns.has("mineral_form")) {
      defaultColumns.push({
        title: "Mineral form",
        key: "mineralForm",
        render: (_: any, site: MineralSite) => {
          return <MayEmptyString value={site.mineralForm.join(", ")} />;
        },
      });
    }
    if (settingStore.displayColumns.has("discover_year")) {
      defaultColumns.push({
        title: "Discover year",
        key: "discoverYear",
        render: (_: any, site: MineralSite) => {
          return <MayEmptyString value={site.discoveredYear?.toString()} />;
        },
      });
    }
    defaultColumns.push({
      title: "Source",
      key: "reference",
      render: (_: any, site: MineralSite) => {
        return (
          <div style={{ maxWidth: 200, display: "inline-block" }}>
            <ReferenceComponent site={site} />
            <Tooltip
              trigger="click"
              title="This key identifies same deposits from the same record of a data source. When select/unselect a deposit, all deposits with the same key will be selected/unselected together."
            >
              <Typography.Text type="secondary" strong={true} className="font-small" style={{ cursor: "pointer" }}>
                &nbsp;(
                {siteGroups.groups[siteGroups.site2groupKey[site.id]].label})
              </Typography.Text>
            </Tooltip>
          </div>
        );
      },
    });
    return defaultColumns;
  }, [commodity.id, siteGroups, selectedRows, ungroupTogether]);

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
    const existingSite = siteGroups.sites.find((site) => site.createdBy.includes(currentUser.url));
    let cb;
    if (existingSite === undefined || existingSite.reference.document.uri !== change.reference.document.uri) {
      // when reference change, it will be a new site
      const draftSite = DraftCreateMineralSite.fromMineralSite(dedupSite, currentUser, change.reference);
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

  const currentSite = siteGroups.sites.find((site) => site.createdBy == user.url);

  let groupBtns = undefined;
  if (siteGroups.nGroups > 1 && selectedRows.groups.size > 0) {
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
    if (selectedRows.groups.size === 1) {
      groupBtns = [ungrpTogBtn];
    } else if (selectedRows.groups.size === siteGroups.nGroups) {
      groupBtns = [ungrpSepBtn];
    } else {
      groupBtns = [ungrpSepBtn, ungrpTogBtn];
    }
    groupBtns = (
      <Space>
        {groupBtns}
        <Tooltip
          trigger={"click"}
          title="“Ungroup Separately” creates N new groups, each containing one or more selected deposits from the same record of a data source. “Ungroup Together” creates a single new group containing all the selected deposits."
        >
          <InfoCircleOutlined />
        </Tooltip>
      </Space>
    );
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
        dataSource={siteGroups.sites}
        loading={isLoading}
        rowClassName={(site) => {
          return site.createdBy.includes(userStore.getCurrentUser()!.url) ? styles.myEditedRow : "";
        }}
        expandable={{
          expandedRowRender: (site) => {
            return (
              <Descriptions
                size={"small"}
                bordered={true}
                items={[
                  {
                    key: "mineral-form",
                    label: "Mineral Forms",
                    children: site.mineralForm.join(", "),
                    span: 3,
                  },
                  {
                    key: "geology-info",
                    label: "Geology Info",
                    span: 3,
                    children:
                      site.geologyInfo === undefined ? undefined : (
                        <Descriptions
                          size={"small"}
                          bordered={true}
                          items={[
                            {
                              key: "alternation",
                              label: "Alternation",
                              children: site.geologyInfo.alternation,
                            },
                            {
                              key: "concentration-process",
                              label: "Concentration Process",
                              children: site.geologyInfo.concentrationProcess,
                            },
                            {
                              key: "ore-control",
                              label: "Ore Control",
                              children: site.geologyInfo.oreControl,
                            },
                            {
                              key: "host-rock-unit",
                              label: "Host Rock Unit",
                              children: site.geologyInfo.hostRock?.unit,
                            },
                            {
                              key: "host-rock-type",
                              label: "Host Rock Type",
                              children: site.geologyInfo.hostRock?.type,
                            },
                            {
                              key: "structure",
                              label: "Structure",
                              children: site.geologyInfo.structure,
                            },
                            {
                              key: "associated-rock-unit",
                              label: "Associated Rock Unit",
                              children: site.geologyInfo.associatedRock?.unit,
                            },
                            {
                              key: "associated-rock-type",
                              label: "Associated Rock Type",
                              children: site.geologyInfo.associatedRock?.type,
                            },
                            {
                              key: "tectonic",
                              label: "Tectonic",
                              children: site.geologyInfo.tectonic,
                            },
                          ]}
                        />
                      ),
                  },
                  {
                    key: "discovered-year",
                    label: "Discovered Year",
                    children: site.discoveredYear,
                  },
                ]}
              />
            );
          },
          showExpandColumn: false,
          expandedRowKeys: Array.from(expandedRowKeys),
        }}
      />
      <EditSiteField key={editField} sites={siteGroups.sites} currentSite={currentSite} editField={editField} onFinish={onEditFinish} commodity={commodity.id} />
    </Flex>
  );
}) as React.FC<EditDedupMineralSiteProps>;
