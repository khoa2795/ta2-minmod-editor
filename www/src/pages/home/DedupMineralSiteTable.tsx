import { DedupMineralSite, useStores } from "models";
import { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { Commodity } from "models/commodity";
import { Alert, Button, Checkbox, Flex, Space, Spin, Table, Typography } from "antd";
import { FetchResult } from "gena-app";
import { EditOutlined, UngroupOutlined } from "@ant-design/icons";
import { EditDedupMineralSite } from "./EditDedupMineralSite";

interface DedupMineralSiteTableProps {
  commodity: Commodity | undefined;
}

const emptyFetchResult = { records: [], total: 0 };

const columns = [
  {
    title: "Select",
    key: "select",
    render: () => <Checkbox />,
  },
  {
    title: "Name",
    key: "name",
    render: (_: any, site: DedupMineralSite) => {
      return <a href={site.id}>{site.getName()}</a>;
    },
    sorter: (a: DedupMineralSite, b: DedupMineralSite) => a.getName().localeCompare(b.getName()),
  },
  {
    title: "Type",
    key: "type",
    render: (_: any, site: DedupMineralSite) => {
      return <span className="font-small">{site.getSiteType()}</span>;
    },
  },
  {
    title: "Rank",
    key: "rank",
    render: (_: any, site: DedupMineralSite) => {
      return <span className="font-small">{site.getSiteRank()}</span>;
    },
  },
  {
    title: "Location",
    key: "location",
    render: (value: any, dedupSite: DedupMineralSite) => {
      if (dedupSite.latitude !== undefined && dedupSite.longitude !== undefined) {
        return `${dedupSite.latitude.toFixed(5)}, ${dedupSite.longitude.toFixed(5)}`;
      }
      return "";
    },
  },
  {
    title: "Country",
    key: "country",
    render: (_: any, site: DedupMineralSite) => {
      return site.getCountry();
    },
  },
  {
    title: "State/Province",
    key: "state",
    render: (_: any, site: DedupMineralSite) => {
      return site.getStateOrProvince();
    },
  },
  {
    title: "Deposit Type",
    key: "depositType",
    render: (_: any, site: DedupMineralSite) => {
      const dt = site.getTop1DepositType();
      if (dt === undefined) {
        return "";
      }
      return dt.name;
    },
  },
  {
    title: "Dep. Score",
    key: "depositConfidence",
    render: (_: any, site: DedupMineralSite) => {
      const dt = site.getTop1DepositType();
      if (dt === undefined) {
        return "";
      }
      return dt.confidence.toFixed(4);
    },
  },
  {
    title: "Tonnage (Mt)",
    dataIndex: "totalTonnage",
    render: (value: number | undefined) => {
      if (value !== undefined) {
        return value.toFixed(5);
      }
      return value;
    },
  },
  {
    title: "Grade (%)",
    dataIndex: "totalGrade",
    render: (value: number | undefined) => {
      if (value !== undefined) {
        return value.toFixed(5);
      }
      return value;
    },
  },
  {
    title: "Action",
    key: "action",
  },
];

export const DedupMineralSiteTable: React.FC<DedupMineralSiteTableProps> = observer(({ commodity }) => {
  const { dedupMineralSiteStore, commodityStore } = useStores();
  const [editingDedupSite, setEditingDedupSite] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (commodity !== undefined) {
      dedupMineralSiteStore.fetchByCommodity(commodity);
    }
  }, [commodity]);

  if (dedupMineralSiteStore.state.value === "error") {
    return <Alert message="Error" description="An error occurred while querying dedup mineral sites. Please try again later." type="error" showIcon />;
  }

  const isLoading = dedupMineralSiteStore.state.value === "updating";
  const dedupMineralSites = commodity === undefined || isLoading ? emptyFetchResult : dedupMineralSiteStore.getByCommodity(commodity);
  columns[columns.length - 1].render = (_: any, site: DedupMineralSite) => {
    return (
      <Space>
        <Button color="primary" size="middle" icon={<EditOutlined />} variant="filled" onClick={() => setEditingDedupSite(site.id)}>
          Edit
        </Button>
        <Button color="default" size="middle" icon={<UngroupOutlined />} variant="filled">
          Ungroup
        </Button>
      </Space>
    );
  };

  return (
    <Table<DedupMineralSite>
      bordered={true}
      size="small"
      rowKey="id"
      columns={columns}
      dataSource={dedupMineralSites.records}
      loading={isLoading ? { size: "large" } : false}
      expandable={{
        expandedRowRender: (site) => <EditDedupMineralSite dedupSite={site} />,
        showExpandColumn: false,
        expandedRowKeys: editingDedupSite === undefined ? [] : [editingDedupSite],
      }}
    />
  );
});
