import React, { useState, useEffect } from 'react';
import '../Styles/DetailedView.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Radio } from 'antd'; // Import Radio from Ant Design

interface ResourceDetails {
  id: number;
  siteName: string;
  location: string;
  crs: string;
  country: string;
  state_or_province: string;
  commodity: string;
  depositType: string;
  depositConfidence: string;
  grade: string;
  tonnage: string;
  reference?: string;
  source?: string;
}

interface DetailedViewProps {
  allMsFields: string[];
  onClose: () => void;
}

const Ungroup: React.FC<DetailedViewProps> = ({ allMsFields, onClose }) => {
  const [columns, setColumns] = useState([
    { title: 'Select', width: 45 }, // New column for radio buttons
    { title: 'Site Name', width: 150 },
    { title: 'Location', width: 120 },
    { title: 'CRS', width: 80 },
    { title: 'Country', width: 100 },
    { title: 'State/Province', width: 100 },
    { title: 'Commodity', width: 100 },
    { title: 'Deposit Type', width: 120 },
    { title: 'Deposit Confidence', width: 120 },
    { title: 'Grade', width: 80 },
    { title: 'Tonnage', width: 80 },
    { title: 'Reference', width: 100 },
    { title: 'Source', width: 100 },
  ]);

  const [detailedData, setDetailedData] = useState<ResourceDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState<number[]>([]); // State for selected rows

  useEffect(() => {
    // Fetching deposit types from the API
    const fetchDepositTypes = async () => {
      const response = await fetch('http://localhost:8000/get_deposit_types');
      const data = await response.json();
      // Do something with deposit types if needed
    };

    fetchDepositTypes(); // Call the function to fetch deposit types
  }, []);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      const details = await Promise.all(
        allMsFields.map(async (msField, index) => {
          const resourceId = msField.split("resource/")[1];
          const response = await fetch(`http://127.0.0.1:8000/get_resource/${resourceId}`);
          if (response.ok) {
            const result = await response.json();
            return { ...result.data, id: index + 1 };
          }
          return null;
        })
      );

      const validDetails = details.filter((detail) => detail !== null);
      setDetailedData(validDetails);
      setLoading(false);
    };

    fetchDetails();
  }, [allMsFields]);

  const onResize = (index: number, newWidth: number) => {
    setColumns((prevColumns) => {
      const newColumns = [...prevColumns];
      newColumns[index].width = Math.max(newWidth, 50);
      return newColumns;
    });
  };

  const handleMouseDown = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = columns[index].width;

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
  };

  const handleRowSelect = (rowId: number) => {
    setSelectedRows(prevSelected => {
      if (prevSelected.includes(rowId)) {
        return prevSelected.filter(id => id !== rowId); // Deselect if already selected
      }
      return [...prevSelected, rowId]; // Add to selection
    });
  };

  return (
    <div className="detailed-view-container">
      <ToastContainer />
      <div className="detailed-view-header">
        <span>Detailed View</span>
        <button className="close-button" onClick={onClose}>
          Close
        </button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="detailed-table">
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th key={index} style={{ width: col.width, position: 'relative' }}>
                  <div>
                    {col.title}
                  </div>
                  {index < columns.length - 1 && (
                    <div
                      onMouseDown={(e) => handleMouseDown(index, e)}
                      style={{
                        cursor: 'col-resize',
                        position: 'absolute',
                        right: '0',
                        top: '0',
                        height: '100%',
                        width: '10px',
                        backgroundColor: 'transparent',
                      }}
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {detailedData.map((resource) => (
              <tr key={resource.id}>
                <td>
                  <Radio
                    checked={selectedRows.includes(resource.id)}
                    onChange={() => handleRowSelect(resource.id)}
                  />
                </td>
                <td>{resource.siteName}</td>
                <td>{resource.location}</td>
                <td>{resource.crs}</td>
                <td>{resource.country}</td>
                <td>{resource.state_or_province}</td>
                <td>{resource.commodity}</td>
                <td>{resource.depositType}</td>
                <td>{resource.depositConfidence}</td>
                <td>{resource.grade}</td>
                <td>{resource.tonnage}</td>
                <td>{resource.reference}</td>
                <td>
                  {resource.source ? (
                    <a href={resource.source} target="_blank" rel="noopener noreferrer">
                      View Source
                    </a>
                  ) : (
                    "N/A"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Ungroup;
