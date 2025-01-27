import { Button, Flex, Space, Table, Typography, message, Checkbox } from "antd";
import { observer } from "mobx-react-lite";
import { useStores, Commodity, DedupMineralSite, MineralSite, Reference, DraftCreateMineralSite, FieldEdit, EditableField, DraftUpdateMineralSite } from "models";
import { useEffect, useMemo, useState } from "react";
import { CanEntComponent, ListCanEntComponent } from "./CandidateEntity";
import { EditOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { EditSiteField } from "./EditSiteField";
import styles from "./EditDedupMineralSite.module.css";
import { Tooltip, Avatar } from "antd";
import { ReferenceComponent } from "pages/editor/editDedupSite/ReferenceComponent";
import { InternalID } from "models/typing";

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
  const { mineralSiteStore, userStore, dedupMineralSiteStore } = stores;
  const user = userStore.getCurrentUser()!;

  const [editField, setEditField] = useState<EditableField | undefined>(undefined);
  const [selectedRows, setSelectedRows] = useState<SelectedSites>(new SelectedSites());

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
      return { sites: siteGroups.groups[grpKey].sites.map((site) => site.id) };
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
    return [
      {
        title: "User",
        key: "user",
        render: (_: any, site: MineralSite, index: number) => {
          const createdBy = site.createdBy.split("/").pop()!;
          const fullName = createdBy;
          const username = createdBy;

          const color = getUserColor(username);
          const confidence = dedupSite.sites[index].score;

          return (
            <Flex align="center" gap={8}>
              <Tooltip title={fullName}>
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
        hidden: siteGroups.sites.length === 1,
        render: (_: any, site: MineralSite) => (
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
            <Typography.Link href={`/resource/${site.id}`} target="_blank">
              {site.name || "-"}
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
          return gradeTonnage.totalGrade.toFixed(6);
        },
      },
      {
        title: "Source",
        key: "reference",
        render: (_: any, site: MineralSite) => {
          return (
            <>
              <ReferenceComponent site={site} />
              <Tooltip
                trigger="click"
                title="This key identifies same deposits from the same record of a data source. When select/unselect a deposit, all deposits with the same key will be selected/unselected together."
              >
                <Typography.Text type="secondary" strong={true} className="font-small" style={{ cursor: "pointer" }}>
                  &nbsp;({siteGroups.groups[siteGroups.site2groupKey[site.id]].label})
                </Typography.Text>
              </Tooltip>
            </>
          );
        },
      },
    ];
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
    if (existingSite === undefined) {
      const draftSite = DraftCreateMineralSite.fromMineralSite(stores, dedupSite, siteGroups.sites, currentUser, change.reference);
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
      />
      <EditSiteField key={editField} sites={siteGroups.sites} currentSite={currentSite} editField={editField} onFinish={onEditFinish} commodity={commodity.id} />
    </Flex>
  );
}) as React.FC<EditDedupMineralSiteProps>;
