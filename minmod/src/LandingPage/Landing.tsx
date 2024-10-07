import React, { useState } from 'react';
import { Button, Checkbox, Spin, Pagination } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import 'react-resizable/css/styles.css';
import '../Styles/Landing.css';
import DetailedView from './DetailedView';
import SearchBar from './SearchBar';

interface TableRow {
  id: number; // Unique identifier for each row
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
  all_ms_fields: string[]; // Include `all_ms_fields` as a property
}

const TableData: React.FC = () => {
  const [filteredData, setFilteredData] = useState<TableRow[]>([]);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 50;

  const [columns, setColumns] = useState([
    { title: 'Select', dataIndex: 'select', width: 100, render: () => <Checkbox /> },
    { title: 'Site Name', dataIndex: 'siteName', width: 200 },
    { title: 'Site Type', dataIndex: 'siteType', width: 150 },
    { title: 'Site Rank', dataIndex: 'siteRank', width: 100 },
    { title: 'Location', dataIndex: 'location', width: 150 },
    { title: 'CRS', dataIndex: 'crs', width: 100 },
    { title: 'Country', dataIndex: 'country', width: 150 },
    { title: 'State/Province', dataIndex: 'state', width: 150 },
    { title: 'Deposit Type', dataIndex: 'depositType', width: 200 },
    { title: 'Deposit Confidence', dataIndex: 'depositConfidence', width: 150 },
    { title: 'Commodity', dataIndex: 'commodity', width: 100 },
    { title: 'Grade', dataIndex: 'grade', width: 100 },
    { title: 'Tonnage', dataIndex: 'tonnage', width: 100 },
    {
      title: 'Edit',
      dataIndex: 'edit',
      width: 80,
      render: (_: any, row: TableRow, rowIndex: number) => (
        <Button
          type="primary"
          shape="circle"
          icon={<EditOutlined />}
          onClick={() => toggleRow(rowIndex)}
          style={{ background: '#005b84', borderColor: '#005b84' }}
        />
      ),
    },
    {
      title: 'Ungroup',
      dataIndex: 'ungroup',
      width: 100,
      render: () => (
        <Button
          type="primary"
          style={{ background: '#005b84', borderColor: '#005b84' }}
        >
          Ungroup
        </Button>
      ),
    },
  ]);

  const handleSearch = async (value: string) => {
    if (value) {
      try {
        setLoading(true);
        const response = await fetch(`http://127.0.0.1:8000/get_sites/${value}`);
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
          console.error('Error fetching site data:', response.statusText);
          setFilteredData([]);
        }
      } catch (error) {
        console.error('Error fetching site data:', error);
        setFilteredData([]);
      } finally {
        setLoading(false);
      }
    } else {
      setFilteredData([]);
    }
  };

  const toggleRow = (rowIndex: number) => {
    setExpandedRows((prevExpandedRows) => {
      if (prevExpandedRows.includes(rowIndex)) {
        return prevExpandedRows.filter((index) => index !== rowIndex);
      }
      return [...prevExpandedRows, rowIndex];
    });
  };

  const onResize = (index: number, newWidth: number) => {
    setColumns((prevColumns) => {
      const newColumns = [...prevColumns];
      newColumns[index].width = Math.max(newWidth, 50);
      return newColumns;
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="mineral-table-container">
      <div>
        <h1>Minmod Editor</h1>
        <SearchBar onSearch={handleSearch} />
      </div>
      <div style={{ overflowX: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <>
            <table className="mineral-table">
              <thead>
                <tr>
                  {columns.map((col, index) => (
                    <th key={index} style={{ width: col.width, position: 'relative' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          width: '100%',
                        }}
                      >
                        <span style={{ flexGrow: 1, whiteSpace: 'nowrap' }}>{col.title}</span>
                        {index < columns.length - 1 && (
                          <div
                            className="resize-handle"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              const startX = e.clientX;
                              const startWidth = col.width;

                              const onMouseMove = (moveEvent: MouseEvent) => {
                                const newWidth = startWidth + (moveEvent.clientX - startX);
                                onResize(index, newWidth);
                              };

                              const onMouseUp = () => {
                                document.removeEventListener('mousemove', onMouseMove);
                                document.removeEventListener('mouseup', onMouseUp);
                              };

                              document.addEventListener('mousemove', onMouseMove);
                              document.addEventListener('mouseup', onMouseUp);
                            }}
                          >
                            ⟷
                          </div>
                        )}
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
                          {col.render ? col.render(row[col.dataIndex as keyof TableRow], row, rowIndex) : row[col.dataIndex as keyof TableRow]}
                        </td>
                      ))}
                    </tr>
                    {expandedRows.includes(rowIndex) && (
  <tr>
    <td colSpan={columns.length}>
      {/* Pass only `allMsFields` and `onClose` */}
      <DetailedView allMsFields={row.all_ms_fields} onClose={() => toggleRow(rowIndex)} />
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
              style={{ textAlign: 'center', marginTop: '20px' }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default TableData;
