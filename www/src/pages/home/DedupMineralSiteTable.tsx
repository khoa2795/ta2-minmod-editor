import { DedupMineralSite, useStores } from "models";
import { useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { Commodity } from "models/commodity";
import { Button, Checkbox, Divider, Space, Table, Typography, message } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { EditDedupMineralSite } from "./editDedupSite/EditDedupMineralSite";
import { Entity } from "components/Entity";
interface DedupMineralSiteTableProps {
  commodity: Commodity | undefined;
}

const emptyFetchResult = { records: [], total: 0 };

export const DedupMineralSiteTable: React.FC<DedupMineralSiteTableProps> = observer(({ commodity }) => {
  const { dedupMineralSiteStore, depositTypeStore, countryStore, stateOrProvinceStore } = useStores();
  const [editingDedupSite, setEditingDedupSite] = useState<string | undefined>(undefined);
  const [selectedDedupSiteIds, setSelectedDedupSiteIds] = useState<Set<string>>(new Set());

  let columns = useMemo(() => {
    return [
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        render: (_: any, site: DedupMineralSite) => {
          return (
            <Typography.Link href={site.uri} target="_blank">
              {site.name || "᠆"}
            </Typography.Link>
          );
        },
        sorter: (a: DedupMineralSite, b: DedupMineralSite) => a.name.localeCompare(b.name),
      },
      {
        title: "Type",
        key: "type",
        render: (_: any, site: DedupMineralSite) => {
          return <span className="font-small">{site.type}</span>;
        },
        sorter: (a: DedupMineralSite, b: DedupMineralSite) => a.type.localeCompare(b.type),
      },
      {
        title: "Rank",
        key: "rank",
        render: (_: any, site: DedupMineralSite) => {
          return <span className="font-small">{site.rank}</span>;
        },
        sorter: (a: DedupMineralSite, b: DedupMineralSite) => a.rank.localeCompare(b.rank),
      },
      {
        title: "Location",
        key: "location",
        render: (value: any, dedupSite: DedupMineralSite) => {
          if (dedupSite.location !== undefined && dedupSite.location.lat !== undefined && dedupSite.location.lon !== undefined) {
            return (
              <Typography.Link href={`http://maps.google.com/maps?z=12&t=m&q=loc:${dedupSite.location.lat}+${dedupSite.location.lon}`} target="_blank">
                {`${dedupSite.location.lat.toFixed(5)}, ${dedupSite.location.lon.toFixed(5)}`}
              </Typography.Link>
            );
          }
          return "᠆";
        },
        sorter: (a: DedupMineralSite, b: DedupMineralSite) => {
          const locA = a.location ? `${a.location.lat?.toFixed(3)},${a.location.lon?.toFixed(3)}` : "";
          const locB = b.location ? `${b.location.lat?.toFixed(3)},${b.location.lon?.toFixed(3)}` : "";
          return locA.localeCompare(locB);
        },
      },
      {
        title: "Country",
        key: "country",
        render: (_: any, site: DedupMineralSite) => {
          if (site.location === undefined || site.location.country.length === 0) {
            return "᠆";
          }

          return (
            <Space split={<Divider type="vertical" />}>
              {site.location.country.map((country) => (
                <Entity key={country} uri={country} store="countryStore" />
              ))}
            </Space>
          );
        },
        sorter: (a: DedupMineralSite, b: DedupMineralSite) => {
          const countryA = a.location?.country.map((iri) => countryStore.getByURI(iri)!.name).join(",") || "";
          const countryB = b.location?.country.map((iri) => countryStore.getByURI(iri)!.name).join(",") || "";
          return countryA.localeCompare(countryB);
        },
      },
      {
        title: "State/Province",
        key: "state",
        render: (_: any, site: DedupMineralSite) => {
          if (site.location === undefined || site.location.stateOrProvince.length === 0) {
            return "᠆";
          }

          return (
            <Space split={<Divider type="vertical" />}>
              {site.location.stateOrProvince.map((province) => (
                <Entity key={province} uri={province} store="stateOrProvinceStore" />
              ))}
            </Space>
          );
        },
        sorter: (a: DedupMineralSite, b: DedupMineralSite) => {
          const stateA = a.location?.stateOrProvince.map((iri) => stateOrProvinceStore.getByURI(iri)!.name).join(",") || "";
          const stateB = b.location?.stateOrProvince.map((iri) => stateOrProvinceStore.getByURI(iri)!.name).join(",") || "";
          return stateA.localeCompare(stateB);
        },
      },
      {
        title: "Deposit Type",
        key: "depositType",
        render: (_: any, site: DedupMineralSite) => {
          const dt = site.getTop1DepositType();
          if (dt === undefined) {
            return "᠆";
          }
          return <Entity uri={dt.uri} store="depositTypeStore" />;
        },
        sorter: (a: DedupMineralSite, b: DedupMineralSite) => {
          const dtA = a.getTop1DepositType()?.uri;
          const dtB = b.getTop1DepositType()?.uri;
          const dtAName = dtA !== undefined ? depositTypeStore.getByURI(dtA)!.name : "";
          const dtBName = dtB !== undefined ? depositTypeStore.getByURI(dtB)!.name : "";
          return dtAName.localeCompare(dtBName);
        },
      },
      {
        title: "Dep. Score",
        key: "depositConfidence",
        render: (_: any, site: DedupMineralSite) => {
          const dt = site.getTop1DepositType();
          if (dt === undefined) {
            return "᠆";
          }
          return dt.confidence.toFixed(4);
        },
      },
      {
        title: "Tonnage (Mt)",
        dataIndex: "totalTonnage",
        render: (_: any, site: DedupMineralSite) => {
          if (site.gradeTonnage !== undefined && site.gradeTonnage.totalTonnage !== undefined) {
            return site.gradeTonnage.totalTonnage.toFixed(4);
          }
          return "᠆";
        },
        sorter: (a: DedupMineralSite, b: DedupMineralSite) => {
          const tonnageA = a.gradeTonnage?.totalTonnage || 0;
          const tonnageB = b.gradeTonnage?.totalTonnage || 0;
          return tonnageA - tonnageB;
        },
      },
      {
        title: "Grade (%)",
        dataIndex: "totalGrade",
        render: (_: any, site: DedupMineralSite) => {
          if (site.gradeTonnage !== undefined && site.gradeTonnage.totalGrade !== undefined) {
            return site.gradeTonnage.totalGrade.toFixed(2);
          }
          return "᠆";
        },
        sorter: (a: DedupMineralSite, b: DedupMineralSite) => {
          const gradeA = a.gradeTonnage?.totalGrade || 0;
          const gradeB = b.gradeTonnage?.totalGrade || 0;
          return gradeA - gradeB;
        },
      },
      {
        title: "Action",
        key: "action",
        render: (_: any, site: DedupMineralSite) => {
          return (
            <Space>
              <Button
                color="primary"
                size="middle"
                icon={<EditOutlined />}
                variant="filled"
                onClick={() => {
                  if (site.id === editingDedupSite) {
                    setEditingDedupSite(undefined);
                  } else {
                    setEditingDedupSite(site.id);
                  }
                }}
              >
                Edit
              </Button>
            </Space>
          );
        },
      },
    ];
  }, [depositTypeStore, countryStore, stateOrProvinceStore, editingDedupSite]);

  useEffect(() => {
    const fetchData = async () => {
      if (commodity !== undefined) {
        await dedupMineralSiteStore.fetchByCommodity(commodity);
      }
    };
    fetchData();
  }, [commodity, dedupMineralSiteStore]);

  const toggleSelectSite = (site: DedupMineralSite) => {
    const newSelectedDedupSiteIds = new Set(selectedDedupSiteIds);
    if (selectedDedupSiteIds.has(site.id)) {
      newSelectedDedupSiteIds.delete(site.id);
    } else {
      newSelectedDedupSiteIds.add(site.id);
    }
    setSelectedDedupSiteIds(newSelectedDedupSiteIds);
  };

  columns = [
    {
      title: "",
      key: "group",
      render: (_: any, site: DedupMineralSite) => <Checkbox type="primary" checked={selectedDedupSiteIds.has(site.id)} onClick={() => toggleSelectSite(site)} />,
    },
    ...columns,
  ];

  const handleGroup = async () => {
    const prevIds = Array.from(selectedDedupSiteIds);
    const allSiteIds = Array.from(selectedDedupSiteIds).flatMap((dedupSiteId) => dedupMineralSiteStore.get(dedupSiteId)!.sites.map((site) => (site.id)));

    const newSiteGroups = [
      {
        sites: allSiteIds,
      },
    ];
    const newIds = await dedupMineralSiteStore.updateSameAsGroup(newSiteGroups);

    if (commodity && commodity.id) {
      const commodityId = commodity.id;
      message.success("Grouping was successful", 3);
      setSelectedDedupSiteIds(new Set());
      await dedupMineralSiteStore.replaceSites(prevIds, newIds, commodityId);
    }
  };

  const isLoading = dedupMineralSiteStore.state.value === "updating";
  const dedupMineralSites = commodity === undefined || isLoading ? emptyFetchResult : dedupMineralSiteStore.getByCommodity(commodity);

  return (
    <>
      {selectedDedupSiteIds.size > 0
        ? [
          <div>
            <Button type="primary" onClick={handleGroup} disabled={selectedDedupSiteIds.size === 1}>
              Group selected sites
            </Button>
          </div>,
          <Table<DedupMineralSite>
            bordered={true}
            size="small"
            rowKey="id"
            pagination={false}
            columns={columns}
            dataSource={Array.from(selectedDedupSiteIds).map((id) => dedupMineralSiteStore.get(id)!)}
          />,
        ]
        : []}
      <Table<DedupMineralSite>
        bordered={true}
        size="small"
        rowKey="id"
        columns={columns}
        dataSource={dedupMineralSites.records}
        loading={isLoading ? { size: "large" } : false}
        expandable={{
          expandedRowRender: (site) => {
            if (editingDedupSite === site.id) {
              return <EditDedupMineralSite commodity={commodity!} dedupSite={site} />;
            }
            return null;
          },
          showExpandColumn: false,
          expandedRowKeys: [...(editingDedupSite ? [editingDedupSite] : [])],
        }}
      />
    </>
  );
});
