import React, { useState, useEffect } from "react";
import { Button, Checkbox, Spin, Pagination, Space } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import "react-resizable/css/styles.css";
import "./Landing.css";
import DetailedView from "./DetailedView";
import SearchBar from "./SearchBar";
import Ungroup from "./Ungroup"; // Import Ungroup component
import { MyButton } from "../../components/MyButton";
interface TableRow {
  id: number;
  siteName: string;
  siteType: string;
  siteRank: string;
  location: string;
  crs: string;
  country: string;
  state: string;
  depositType: string;
  depositConfidence: string;
  commodity: string;
  grade: string;
  tonnage: string;
  all_ms_fields: string[];
}

const TableData: React.FC = () => {
  const [filteredData, setFilteredData] = useState<TableRow[]>([]);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20); // Default page size is 20
  const [sortOrder, setSortOrder] = useState<"ascend" | "descend" | null>(null);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [isUngroupVisible, setIsUngroupVisible] = useState<boolean>(false); // State for Ungroup visibility
  const [currentRowData, setCurrentRowData] = useState<TableRow | null>(null); // To store data for the Ungroup component
  const [ungroupedRowIndex, setUngroupedRowIndex] = useState<number | null>(
    null
  ); // To track which row is ungrouped
  const [username, setUserName] = useState<string | null>(null);
  const [toggle, setToggle] = useState(false);

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
        const valueA = a[columnKey as keyof TableRow] || "";
        const valueB = b[columnKey as keyof TableRow] || "";

        if (typeof valueA === "string" && typeof valueB === "string") {
          return order === "ascend"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
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

  const handleUngroup = (rowIndex: number) => {
    const rowData = filteredData[rowIndex];
    setCurrentRowData(rowData); // Set the data for the selected row
    setIsUngroupVisible(true); // Show the Ungroup component
    setUngroupedRowIndex(rowIndex); // Set the ungrouped row index
  };

  const columns = [
    {
      title: "Select",
      dataIndex: "select",
      width: 45,
      render: () => <Checkbox />,
    },
    {
      title: "Site Name",
      dataIndex: "name",
      width: 150,
      className: "site-name",
      render: (value: any) => (
        <div style={{ whiteSpace: "normal", wordWrap: "break-word" }}>
          {value}
        </div>
      ),
      sorter: true,
      sortIcons: true,
    },
    {
      title: "Site Type",
      dataIndex: "siteType",
      width: 70,
      className: "resizable",
      render: (value: any) => {
        return value !== "NotSpecified" ? (
          <span style={{ fontSize: "12px" }}>{value}</span>
        ) : (
          ""
        );
      },
      sorter: true,
    },
    {
      title: "Site Rank",
      dataIndex: "siteRank",
      width: 70,
      className: "resizable",
      sorter: true,
    },
    {
      title: "Location",
      dataIndex: "location",
      width: 80,
      className: "resizable",
      render: (value: any) => {
        const coords = value.match(/POINT\s*\(([-\d.]+)\s+([-\d.]+)\)/);

        if (coords && coords.length === 3) {
          const longitude = parseFloat(coords[1]).toFixed(5);
          const latitude = parseFloat(coords[2]).toFixed(5);
          return (
            <div>
              <span>{latitude}</span>
              <br />
              <span>{longitude}</span>
            </div>
          );
        }
        return "";
      },
      sorter: true,
    },
    {
      title: "CRS",
      dataIndex: "crs",
      width: 80,
      className: "resizable",
      render: (value: any) => (value ? value.replace("EPSG:", "") : value),
      sorter: true,
    },
    {
      title: "Country",
      dataIndex: "country",
      width: 80,
      className: "resizable",
      sorter: true,
    },
    {
      title: "State/Province",
      dataIndex: "state",
      width: 120,
      className: "resizable",
      sorter: true,
    },
    {
      title: "Deposit Type",
      dataIndex: "depositType",
      width: 140,
      className: "resizable",
      sorter: true,
    },
    {
      title: "Deposit Confidence",
      dataIndex: "depositConfidence",
      width: 120,
      className: "resizable",
      sorter: true,
    },
    {
      title: "Commodity",
      dataIndex: "commodity",
      width: 80,
      className: "resizable",
      sorter: true,
    },
    {
      title: "Grade",
      dataIndex: "grade",
      width: 60,
      render: (value: any) => {
        const numericValue = parseFloat(value);
        return !isNaN(numericValue) && numericValue !== 0
          ? numericValue.toFixed(5)
          : "";
      },
      sorter: true,
    },
    {
      title: "Tonnage",
      dataIndex: "tonnage",
      width: 80,
      className: "resizable",
      render: (value: any) => {
        const numericValue = parseFloat(value);
        return !isNaN(numericValue) && numericValue !== 0
          ? numericValue.toFixed(5)
          : "";
      },
      sorter: true,
    },
    {
      title: "Actions",
      dataIndex: "actions",
      width: 100, // Adjusted width for Edit and Ungroup buttons
      render: (_: any, row: TableRow, rowIndex: number) => (
        <div
          style={{
            textAlign: "center",
          }}
        >
          <Space direction="vertical">
            <MyButton title="Edit" onClick={() => toggleRow(rowIndex)} />
            <MyButton title="Ungroup" onClick={() => handleUngroup(rowIndex)} />
          </Space>
        </div>
      ),
    },
  ];

  const handleSearch = async (value: string) => {
    if (value) {
      try {
        setLoading(true);
        const response = await fetch(`/get_sites/${value}`);
        if (response.ok) {
          const data = await response.json();
          const dataWithIds = data.data.map((row: any, index: number) => ({
            ...row,
            id: index + 1, // Add a unique id to each row
            all_ms_fields: row.all_ms_fields || [], // Map `all_ms_fields` from the response
          }));
          setFilteredData(dataWithIds);
          setCurrentPage(1);
        } else {
          setFilteredData([]);
        }
      } catch (error) {
        setFilteredData([]);
      } finally {
        setLoading(false);
      }
    } else {
      setFilteredData([]);
    }
  };

  const handleGroup = () => {
    // Handle group functionality here
    console.log("Group button clicked");
  };

  const toggleRow = (rowIndex: number) => {
    console.log("Toggling row:", rowIndex);
    setExpandedRows((prevExpandedRows) => {
      if (prevExpandedRows.includes(rowIndex)) {
        return prevExpandedRows.filter((index) => index !== rowIndex);
      }
      return [...prevExpandedRows, rowIndex];
    });
  };

  const onResize = (index: number, newWidth: number) => {
    const newColumns = [...columns];
    newColumns[index] = {
      ...newColumns[index],
      width: newWidth,
    };
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

  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="mineral-table-container">
      {/* Header Section */}
      <div className="header">
        <h1 className="header-title">Minmod Editor</h1>
        <Button type="primary" onClick={handleLogout} className="logout-button">
          Logout
        </Button>
      </div>

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
                    <th
                      key={index}
                      style={{ width: col.width }}
                      className={col.className}
                    >
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
                          onClick={() => handleSort(col.dataIndex)}
                        >
                          {col.title}
                          {sortColumn === col.dataIndex &&
                            (sortOrder === "ascend" ? (
                              <ArrowUpOutlined />
                            ) : (
                              <ArrowDownOutlined />
                            ))}
                        </span>
                        <div
                          className="resize-handle"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            const startX = e.clientX;
                            const startWidth = col.width;

                            const onMouseMove = (moveEvent: MouseEvent) => {
                              const newWidth = Math.max(
                                startWidth + (moveEvent.clientX - startX),
                                50
                              );
                              onResize(index, newWidth);
                            };

                            const onMouseUp = () => {
                              document.removeEventListener(
                                "mousemove",
                                onMouseMove
                              );
                              document.removeEventListener(
                                "mouseup",
                                onMouseUp
                              );
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
                  <React.Fragment key={row.id}>
                    <tr>
                      {columns.map((col, colIndex) => (
                        <td key={colIndex} style={{ width: col.width }}>
                          {col.render
                            ? col.render(
                                row[col.dataIndex as keyof TableRow],
                                row,
                                rowIndex
                              )
                            : row[col.dataIndex as keyof TableRow]}
                        </td>
                      ))}
                    </tr>
                    {expandedRows.includes(rowIndex) && (
                      <tr>
                        <td colSpan={columns.length}>
                          <DetailedView
                            allMsFields={row.all_ms_fields}
                            username={username ?? ""}
                            onClose={() => toggleRow(rowIndex)}
                          />
                        </td>
                      </tr>
                    )}
                    {ungroupedRowIndex === rowIndex &&
                      isUngroupVisible &&
                      currentRowData && (
                        <tr>
                          <td colSpan={columns.length}>
                            <Ungroup
                              allMsFields={currentRowData.all_ms_fields}
                              onClose={() => {
                                setIsUngroupVisible(false);
                                setUngroupedRowIndex(null);
                                setCurrentRowData(null);
                              }}
                            />
                          </td>
                        </tr>
                      )}
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
              pageSizeOptions={[
                "10",
                "20",
                "50",
                "100",
                `${filteredData.length}`,
              ]}
              onShowSizeChange={(_, size) =>
                handlePageSizeChange(
                  size === filteredData.length ? filteredData.length : size
                )
              }
            />
          </>
        )}
      </div>
    </div>
  );
};

export default TableData;
