import { Country, DedupMineralSite, StateOrProvince, useStores } from "models";
import { useEffect, useMemo, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { Commodity } from "models/commodity";
import { Button, Checkbox, Divider, Input, InputRef, Space, Table, TableColumnType, Typography, message } from "antd";
import { EditOutlined, PlusOutlined, SearchOutlined, UngroupOutlined } from "@ant-design/icons";
import { EditDedupMineralSite } from "./editDedupSite/EditDedupMineralSite";
import { Entity } from "components/Entity";
import { Empty, Grade, Tonnage } from "components/Primitive";
import { filter } from "lodash";
import { FilterDropdownProps } from "antd/es/table/interface";

import Highlighter from "react-highlight-words";
import Fuse from "fuse.js";

interface DedupMineralSiteTableProps {
  commodity: Commodity | undefined;
  country: Country | undefined;
  stateOrProvince: StateOrProvince | undefined;
}

const emptyFetchResult = { records: [], total: 0 };

const getUniqueType = (sites: DedupMineralSite[]) => {
  const values = new Set<string>();
  sites.forEach((site) => {
    if (site.type !== undefined) {
      values.add(site.type);
    }
  });
  return Array.from(values);
};

const getUniqueRank = (sites: DedupMineralSite[]) => {
  const values = new Set<string>();
  sites.forEach((site) => {
    if (site.rank !== undefined) {
      values.add(site.rank);
    }
  });
  return Array.from(values);
};

type DataIndex = keyof DedupMineralSite;

const getColumnSearchProps = (
  dataIndex: DataIndex,
  searchText: string,
  searchedColumn: string,
  searchInput: React.RefObject<InputRef>,
  setSearchText: (text: string) => void,
  setSearchedColumn: (column: DataIndex) => void,
  handleSearch: (selectedKeys: string[], confirm: FilterDropdownProps["confirm"], dataIndex: DataIndex) => void,
  handleReset: (clearFilters: () => void) => void
): TableColumnType<DedupMineralSite> => ({
  filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }: FilterDropdownProps) => (
    <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
      <Input
        ref={searchInput}
        placeholder={`Search ${dataIndex}`}
        value={selectedKeys[0]}
        onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
        onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
        style={{ marginBottom: 8, display: "block" }}
      />
      <Space>
        <Button type="primary" onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)} icon={<SearchOutlined />} size="small" style={{ width: 90 }}>
          Search
        </Button>
        <Button onClick={() => clearFilters && handleReset(clearFilters)} size="small" style={{ width: 90 }}>
          Reset
        </Button>
        <Button
          type="link"
          size="small"
          onClick={() => {
            confirm({ closeDropdown: false });
            setSearchText((selectedKeys as string[])[0]);
            setSearchedColumn(dataIndex);
          }}
        >
          Filter
        </Button>
        <Button
          type="link"
          size="small"
          onClick={() => {
            close();
          }}
        >
          close
        </Button>
      </Space>
    </div>
  ),
  filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />,
  onFilter: (value, record) =>
    (record as any)[dataIndex]
      .toString()
      .toLowerCase()
      .includes((value as string).toLowerCase()),
  filterDropdownProps: {
    onOpenChange(open) {
      if (open) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
  },
  render: (text) =>
    searchedColumn === dataIndex ? (
      <Highlighter highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }} searchWords={[searchText]} autoEscape textToHighlight={text ? text.toString() : ""} />
    ) : (
      text
    ),
});

export const DedupMineralSiteTable: React.FC<DedupMineralSiteTableProps> = observer(({ commodity, country, stateOrProvince }) => {
  const { dedupMineralSiteStore, depositTypeStore, countryStore, stateOrProvinceStore } = useStores();
  const [editingDedupSite, setEditingDedupSite] = useState<string | undefined>(undefined);
  const [selectedDedupSiteIds, setSelectedDedupSiteIds] = useState<Set<string>>(new Set());

  const [nameSearchText, nameFilterFn, nameFilterProps] = useTextSearch("name");
  const [typeSearchText, typeFilterFn, typeFilterProps] = useTextSearch("type");
  const [rankSearchText, rankFilterFn, rankFilterProps] = useTextSearch("rank");

  useEffect(() => {
    if (commodity !== undefined) {
      dedupMineralSiteStore.searchAndCache(commodity, country, stateOrProvince);
    }
  }, [commodity, country, stateOrProvince]);

  const isLoading = dedupMineralSiteStore.state.value === "updating";
  const dedupMineralSites = commodity === undefined || isLoading ? emptyFetchResult : dedupMineralSiteStore.getCacheSearchResult(commodity, country, stateOrProvince);

  const filteredDedupMineralSites = useMemo(() => {
    let lstdms = dedupMineralSites.records;
    if (nameFilterFn !== undefined) {
      lstdms = nameFilterFn(lstdms);
    }
    if (typeFilterFn !== undefined) {
      lstdms = typeFilterFn(lstdms);
    }
    if (rankFilterFn !== undefined) {
      lstdms = rankFilterFn(lstdms);
    }
    return { records: lstdms, total: dedupMineralSites.total };
  }, [dedupMineralSites, nameFilterFn, typeFilterFn, rankFilterFn]);

  let columns = useMemo(() => {
    return [
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        ...nameFilterProps,
        render: (_: any, site: DedupMineralSite) => {
          return (
            <Typography.Link href={`/derived/${site.id}`} target="_blank">
              <Highlight text={site.name || "␣"} searchText={nameSearchText} />
            </Typography.Link>
          );
        },
        sorter: (a: DedupMineralSite, b: DedupMineralSite) => a.name.localeCompare(b.name),
      },
      {
        title: "Type",
        key: "type",
        ...typeFilterProps,
        render: (_: any, site: DedupMineralSite) => {
          return (
            <span className="font-small">
              <Highlight text={site.type} searchText={typeSearchText} />
            </span>
          );
        },
        sorter: (a: DedupMineralSite, b: DedupMineralSite) => a.type.localeCompare(b.type),
      },
      {
        title: "Rank",
        key: "rank",
        ...rankFilterProps,
        render: (_: any, site: DedupMineralSite) => {
          return (
            <span className="font-small">
              <Highlight text={site.rank} searchText={rankSearchText} />
            </span>
          );
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
          return <Empty />;
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
            return <Empty />;
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
            return <Empty />;
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
            return <Empty />;
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
            return <Empty />;
          }
          return dt.confidence.toFixed(4);
        },
      },
      {
        title: "Tonnage (Mt)",
        dataIndex: "totalTonnage",
        render: (_: any, site: DedupMineralSite) => {
          return <Tonnage tonnage={site.gradeTonnage?.totalTonnage} />;
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
          return <Grade grade={site.gradeTonnage?.totalGrade} />;
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
  }, [depositTypeStore, countryStore, stateOrProvinceStore, editingDedupSite, nameSearchText, typeSearchText, rankSearchText]);

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
    const allSiteIds = Array.from(selectedDedupSiteIds).flatMap((dedupSiteId) => dedupMineralSiteStore.get(dedupSiteId)!.sites.map((site) => site.id));

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

  const selectedDedupSites = useMemo(() => {
    return Array.from(selectedDedupSiteIds)
      .map((id) => dedupMineralSiteStore.get(id))
      .filter((site) => site !== undefined) as DedupMineralSite[];
  }, [selectedDedupSiteIds]);

  return (
    <>
      {selectedDedupSites.length > 0 ? (
        <>
          <div>
            <Button type="primary" onClick={handleGroup} disabled={selectedDedupSiteIds.size === 1}>
              Group selected sites
            </Button>
          </div>
          <Table<DedupMineralSite> bordered={true} size="small" rowKey="id" pagination={false} columns={columns} showSorterTooltip={false} dataSource={selectedDedupSites} />
        </>
      ) : (
        <></>
      )}
      <Table<DedupMineralSite>
        bordered={true}
        size="small"
        rowKey="id"
        columns={columns}
        dataSource={filteredDedupMineralSites.records}
        loading={isLoading ? { size: "large" } : false}
        showSorterTooltip={false}
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

const Highlight = ({ text, searchText }: { text: string; searchText: string }) => {
  if (searchText.length > 0) {
    return <Highlighter highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }} searchWords={searchText.split(" ")} autoEscape textToHighlight={text} />;
  }
  return <>{text}</>;
};

const useTextSearch = (property: "name" | "type" | "rank"): [string, ((dms: DedupMineralSite[]) => DedupMineralSite[]) | undefined, TableColumnType<DedupMineralSite>] => {
  const [searchText, setSearchText] = useState("");
  const searchInput = useRef<InputRef>(null);

  // somehow handle reset doesn't work. It doesn't disable the filter mode and the filter icon is still colored
  // if we pass selectedKeys as empty array, it will reset the filter mode
  const handleSearch = (selectedKeys: string[], confirm: FilterDropdownProps["confirm"]) => {
    confirm();
    setSearchText(selectedKeys[0] || "");
  };

  const columnProps = {
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }: FilterDropdownProps) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${property}`}
          value={selectedKeys[0]}
          allowClear={true}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onClear={() => handleSearch([], confirm)}
          onPressEnter={() => handleSearch(selectedKeys as string[], confirm)}
          style={{ width: 200 }}
        />
      </div>
    ),
    filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />,
    filterDropdownProps: {
      onOpenChange(open: boolean) {
        if (open) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
  };

  const filterFn = useMemo(() => {
    let filterFn = undefined;
    if (searchText !== "") {
      if (property === "rank" || property === "type") {
        const query = searchText.toLowerCase();
        filterFn = (lst: DedupMineralSite[]) => {
          return filter(lst, (site) => {
            return (site[property] || "").toLowerCase().includes(query);
          });
        };
      } else {
        filterFn = (lst: DedupMineralSite[]) => {
          const fuse = new Fuse(lst, {
            minMatchCharLength: 2,
            keys: [property],
          });
          return fuse.search(searchText).map((r) => r.item);
        };
      }
    }
    return filterFn;
  }, [searchText]);

  return [searchText, filterFn, columnProps];
};
