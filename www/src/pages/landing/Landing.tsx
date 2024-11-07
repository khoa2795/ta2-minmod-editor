import React, { useState, useEffect, ReactElement } from "react";
import { Button, Checkbox, Spin, Pagination, Space } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import "react-resizable/css/styles.css";
import "./Landing.css";
import DetailedView from "./DetailedView";
import SearchBar from "./SearchBar";
import Ungroup from "./Ungroup"; // Import Ungroup component
import { MyButton } from "../../components/MyButton";
import { DedupMineralSite } from "../../models/DedupMineralSite";
import { dedupMineralSiteStore } from "../../stores/DedupMineralSiteStore";
import { commodityStore } from "../../stores/CommodityStore";

// const Number = (val: number) => {

// }

// TODO: fix typing!
function renderColumn(column: { dataIndex?: string; render?: (cell: any, row: DedupMineralSite, rowIndex: number) => any }, row: DedupMineralSite, rowIndex: number): ReactElement {
  if (column.render !== undefined) {
    let cell = null;
    if (column.dataIndex !== undefined) {
      cell = row[column.dataIndex as keyof DedupMineralSite];
    }
    return column.render(cell, row, rowIndex);
  }
  if (column.dataIndex !== undefined) {
    return row[column.dataIndex as keyof DedupMineralSite] as any;
  }
  throw new Error("Column must have either a dataIndex or a render function");
}

const TableData: React.FC = () => {
  const [filteredData, setFilteredData] = useState<DedupMineralSite[]>([]);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20); // Default page size is 20
  const [sortOrder, setSortOrder] = useState<"ascend" | "descend" | null>(null);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [isUngroupVisible, setIsUngroupVisible] = useState<boolean>(false); // State for Ungroup visibility
  const [currentRowData, setCurrentRowData] = useState<DedupMineralSite | null>(null); // To store data for the Ungroup component
  const [ungroupedRowIndex, setUngroupedRowIndex] = useState<number | null>(null); // To track which row is ungrouped
  const [username, setUserName] = useState<string | null>(null);
  const [toggle, setToggle] = useState(false);
  const [selectedRows, setSelectedRows] = useState<DedupMineralSite[]>([]); // Stores selected rows

  useEffect(() => {
    const token = localStorage.getItem("session_id");

    if (!token) {
      console.error("No session token found. Redirecting to login.");
      window.location.href = "/";
      return;
    }

    // Call whoami endpoint to validate the token
    const validateSession = async () => {
      try {
        const response = await fetch("/users/me/", {
          method: "GET",
          headers: {
            Cookie: `session=${token}`, // Set the session token in the Cookie header
          },
          credentials: "include",
        });

        if (!response.ok) {
          console.warn("Session validation failed. Redirecting to login.");
          window.location.href = "/";
        } else {
          const userData = await response.json();
          setUserName(userData.username);
          console.log("User session validated:", userData);
        }
      } catch (error) {
        console.error("Error validating session:", error);
        window.location.href = "/";
      }
    };

    validateSession();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("session_id"); // Clear session token
    window.location.href = "/"; // Redirect to login page
  };

  // Sorting logic
  const handleSort = (columnKey: string) => {
    let order: "ascend" | "descend" | null = "ascend";

    if (sortColumn === columnKey && sortOrder === "ascend") {
      order = "descend";
    } else if (sortColumn === columnKey && sortOrder === "descend") {
      order = null;
    }

    setSortOrder(order);
    setSortColumn(columnKey);

    if (order) {
      const sortedData = [...filteredData].sort((a, b) => {
        const valueA = a[columnKey as keyof DedupMineralSite] || "";
        const valueB = b[columnKey as keyof DedupMineralSite] || "";

        if (typeof valueA === "string" && typeof valueB === "string") {
          return order === "ascend" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        }

        if (typeof valueA === "number" && typeof valueB === "number") {
          return order === "ascend" ? valueA - valueB : valueB - valueA;
        }

        return 0;
      });

      setFilteredData(sortedData);
    } else {
      setFilteredData([...filteredData]); // Reset sorting
    }
  };

  const handleRowSelection = (row: DedupMineralSite) => {
    setSelectedRows((prevSelectedRows) => {
      const isRowSelected = prevSelectedRows.find((selectedRow) => selectedRow.uri === row.uri);
      if (isRowSelected) {
        // Deselect row
        return prevSelectedRows.filter((selectedRow) => selectedRow.uri !== row.uri);
      } else {
        // Select row
        return [...prevSelectedRows, row];
      }
    });
  };

  const closeUngroup = () => {
    setIsUngroupVisible(false);
    setCurrentRowData(null);
  };

  const [columns, setColumns] = useState([
    {
      title: "Select",
      dataIndex: "select",
      width: 45,
      render: (_: any, site: DedupMineralSite) => <Checkbox checked={selectedRows.some((row) => row.uri === site.uri)} onChange={() => handleRowSelection(site)} />,
    },
    {
      title: "Site Name",
      width: 150,
      className: "site-name",
      render: (_: any, site: DedupMineralSite) => {
        return <div style={{ whiteSpace: "normal", wordWrap: "break-word" }}>{site.getName()}</div>;
      },
      sorter: true,
      sortIcons: true,
    },
    {
      title: "Site Type",
      width: 70,
      className: "resizable",
      render: (_: any, site: DedupMineralSite) => {
        return <span style={{ fontSize: "12px" }}>{site.getSiteType()}</span>;
      },
      sorter: true,
    },
    {
      title: "Site Rank",
      dataIndex: "siteRank",
      width: 70,
      className: "resizable",
      sorter: true,
      render: (_: any, site: DedupMineralSite) => {
        return <span style={{ fontSize: "12px" }}>{site.getSiteRank()}</span>;
      },
    },
    {
      title: "Location",
      dataIndex: "location",
      width: 80,
      className: "resizable",
      render: (value: any, dedupSite: DedupMineralSite) => {
        if (dedupSite.latitude !== undefined && dedupSite.longitude !== undefined) {
          return (
            <span style={{ whiteSpace: "break-spaces" }}>
              {dedupSite.latitude.toFixed(5)}, {dedupSite.longitude.toFixed(5)}
            </span>
          );
        }
        return "";
      },
      sorter: true,
    },
    {
      title: "Country",
      width: 80,
      className: "resizable",
      sorter: true,
      render: (_: any, site: DedupMineralSite) => {
        return <div style={{ whiteSpace: "normal", wordWrap: "break-word" }}>{site.getCountry()}</div>;
      },
    },
    {
      title: "State/Province",
      dataIndex: "state",
      width: 120,
      className: "resizable",
      sorter: true,
      render: (_: any, site: DedupMineralSite) => {
        return <div style={{ whiteSpace: "normal", wordWrap: "break-word" }}>{site.getStateOrProvince()}</div>;
      },
    },
    {
      title: "Deposit Type",
      dataIndex: "depositType",
      width: 140,
      className: "resizable",
      sorter: true,
      render: (_: any, site: DedupMineralSite) => {
        const dt = site.getTop1DepositType();
        if (dt === undefined) {
          return "";
        }
        return <div style={{ whiteSpace: "normal", wordWrap: "break-word" }}>{dt.name}</div>;
      },
    },
    {
      title: "Deposit Confidence",
      dataIndex: "depositConfidence",
      width: 120,
      className: "resizable",
      sorter: true,
      render: (_: any, site: DedupMineralSite) => {
        const dt = site.getTop1DepositType();
        if (dt === undefined) {
          return "";
        }
        return <div style={{ whiteSpace: "normal", wordWrap: "break-word" }}>{dt.confidence.toFixed(2)}</div>;
      },
    },
    {
      title: "Commodity",
      dataIndex: "commodity",
      width: 80,
      className: "resizable",
      sorter: true,
      render: (commURI: string) => {
        const commodity = commodityStore.getCommodityByURI(commURI)!;
        return <a href={commodity.uri}>{commodity.name}</a>;
      },
    },
    {
      title: "Grade",
      dataIndex: "grade",
      width: 60,
      render: (value: number | undefined) => {
        if (value !== undefined) {
          return value.toFixed(5);
        }
        return value;
      },
      sorter: true,
    },
    {
      title: "Tonnage",
      dataIndex: "tonnage",
      width: 80,
      className: "resizable",
      render: (value: number | undefined) => {
        if (value !== undefined) {
          return value.toFixed(5);
        }
        return value;
      },
      sorter: true,
    },
    {
      title: "Actions",
      dataIndex: "actions",
      width: 100,
      render: (_: any, row: DedupMineralSite, rowIndex: number) => (
        <div style={{ textAlign: "center" }}>
          <Space direction="vertical">
            <MyButton title="Edit" onClick={() => toggleRow(rowIndex)} />
            <MyButton title="Ungroup" onClick={() => handleUngroup(rowIndex)} />
          </Space>
        </div>
      ),
    },
  ]);
  const onResize = (index: number, newWidth: number) => {
    setColumns((prevColumns) => {
      const newColumns = [...prevColumns];
      newColumns[index] = { ...newColumns[index], width: newWidth };
      return newColumns;
    });
  };
  const handleSearch = async (value: string) => {
    try {
      setLoading(true);
      const dataWithIds = await dedupMineralSiteStore.findByCommodity(value);
      console.log("search", { value, dataWithIds });
      setFilteredData(dataWithIds);
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  };

  const handleGroup = () => {};

  const toggleRow = (rowIndex: number) => {
    console.log("Toggling row:", rowIndex);
    setExpandedRows((prevExpandedRows) => {
      if (prevExpandedRows.includes(rowIndex)) {
        return prevExpandedRows.filter((index) => index !== rowIndex);
      }
      return [...prevExpandedRows, rowIndex];
    });
  };
  const handleUngroup = (rowIndex: number) => {
    console.log("Toggling row:", rowIndex);
    setExpandedRows((prevExpandedRows) => {
      if (prevExpandedRows.includes(rowIndex)) {
        return prevExpandedRows.filter((index) => index !== rowIndex);
      }
      return [...prevExpandedRows, rowIndex];
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number | string) => {
    if (newPageSize === "All") {
      console.log("Total records:", filteredData.length);
      setPageSize(filteredData.length); // Set pageSize to total number of records
    } else {
      setPageSize(Number(newPageSize));
    }
    setCurrentPage(1); // Reset to page 1 when the page size changes
  };

  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="mineral-table-container">
      {/* Header Section */}
      <div className="header">
        <h1 className="header-title">Minmod Editor</h1>
        <Button type="primary" onClick={handleLogout} className="logout-button">
          Logout
        </Button>
      </div>
      {/* Sticky Selected Rows */}
      {selectedRows.length > 0 && (
        <div className="sticky-selected-rows">
          <h3>Selected Rows</h3>
          <table className="selected-rows-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.dataIndex}>{col.title}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {selectedRows.map((row, rowIndex) => (
                <tr key={row.uri}>
                  {columns.map((col) => (
                    <td key={col.dataIndex}>{renderColumn(col, row, rowIndex)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Render Ungroup component as an overlay when isUngroupVisible is true */}
      {isUngroupVisible && currentRowData && (
        <div className="ungroup-overlay">
          <Ungroup allMsFields={currentRowData.getSiteURIs()} onClose={closeUngroup} commodity={currentRowData.commodity} />
        </div>
      )}

      {/* Search Bar and Group Button */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          paddingTop: "20px",
        }}
      >
        <SearchBar onSearch={handleSearch} />
        <Button
          type="default"
          onClick={handleGroup}
          style={{
            background: "#005b84",
            borderColor: "#005b84",
            color: "white",
            borderRadius: "4px",
            width: "100px",
            textAlign: "center",
            marginBottom: "10px",
          }}
        >
          Group
        </Button>
      </div>

      {/* Table and Pagination */}
      <div className="table-container">
        {loading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Spin size="large" />
          </div>
        ) : (
          <>
            <table className="mineral-table">
              <thead>
                <tr>
                  {columns.map((col, index) => (
                    <th key={index} style={{ width: col.width }} className={col.className}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          width: "100%",
                        }}
                      >
                        <span
                          style={{
                            flexGrow: 1,
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                          }}
                          // TODO: fix me!!
                          onClick={col.dataIndex !== undefined ? () => handleSort(col.dataIndex) : undefined}
                        >
                          {col.title}
                          {sortColumn === col.dataIndex && (sortOrder === "ascend" ? <ArrowUpOutlined /> : <ArrowDownOutlined />)}
                        </span>
                        <div
                          className="resize-handle"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            const startX = e.clientX;
                            const startWidth = col.width;

                            const onMouseMove = (moveEvent: MouseEvent) => {
                              const newWidth = Math.max(startWidth + (moveEvent.clientX - startX), 50);
                              onResize(index, newWidth);
                            };

                            const onMouseUp = () => {
                              document.removeEventListener("mousemove", onMouseMove);
                              document.removeEventListener("mouseup", onMouseUp);
                            };

                            document.addEventListener("mousemove", onMouseMove);
                            document.addEventListener("mouseup", onMouseUp);
                          }}
                        />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row, rowIndex) => (
                  <React.Fragment key={row.uri}>
                    <tr key={row.uri}>
                      {columns.map((col, colIndex) => (
                        <td key={colIndex} style={{ width: col.width }}>
                          {col.render ? col.render(row[col.dataIndex as keyof DedupMineralSite], row, rowIndex) : (row[col.dataIndex as keyof DedupMineralSite] as any)}
                        </td>
                      ))}
                    </tr>
                    {expandedRows.includes(rowIndex) && (
                      <tr>
                        <td colSpan={columns.length}>
                          <DetailedView allMsFields={row.getSiteURIs()} username={username ?? ""} onClose={() => toggleRow(rowIndex)} commodity={commodityStore.getCommodityByURI(row.commodity)!} />
                        </td>
                      </tr>
                    )}
                    {ungroupedRowIndex !== null && isUngroupVisible && currentRowData && <Ungroup allMsFields={row.getSiteURIs()} onClose={() => toggleRow(rowIndex)} commodity={row.commodity} />}
                  </React.Fragment>
                ))}
              </tbody>
            </table>

            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredData.length}
              onChange={handlePageChange}
              style={{ textAlign: "center", marginTop: "20px" }}
              showSizeChanger
              pageSizeOptions={["10", "20", "50", "100", `${filteredData.length}`]}
              onShowSizeChange={(_, size) => handlePageSizeChange(size === filteredData.length ? filteredData.length : size)}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default TableData;
