import React, { useState, useEffect } from 'react';
import { EditOutlined } from '@ant-design/icons';
import '../Styles/DetailedView.css';
import EditModal from './editModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

const DetailedView: React.FC<DetailedViewProps> = ({ allMsFields, onClose }) => {
  const [columns, setColumns] = useState([
    { title: 'Site Name', width: 200 },
    { title: 'Location', width: 150 },
    { title: 'CRS', width: 100 },
    { title: 'Country', width: 150 },
    { title: 'State/Province', width: 150 },
    { title: 'Commodity', width: 100 },
    { title: 'Deposit Type', width: 200 },
    { title: 'Deposit Confidence', width: 150 },
    { title: 'Grade', width: 100 },
    { title: 'Tonnage', width: 100 },
    { title: 'Reference', width: 150 },
    { title: 'Source', width: 100 },
  ]);

  const [detailedData, setDetailedData] = useState<ResourceDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [editingRowId, setEditingRowId] = useState<number | null>(null);

  // Fetch details from the backend
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

  // Handle resizing of columns
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

  // Handle edit modal visibility
  const handleEditClick = (rowId: number, title: string) => {
    setEditingRowId(rowId);
    setModalTitle(title);
    setModalVisible(true);
  };

  // Handle saving changes from modal
  const handleSaveChanges = (rowId: number, newValue: string, newReference: string) => {
    setDetailedData((prevData) =>
      prevData.map((row) =>
        row.id === rowId
          ? {
              ...row,
              siteName: modalTitle.toLowerCase() === 'site name' ? newValue : row.siteName,
              location: modalTitle.toLowerCase() === 'location' ? newValue : row.location,
              depositType: modalTitle.toLowerCase() === 'deposit type' ? newValue : row.depositType,
              reference: newReference || row.reference,
            }
          : row
      )
    );
    setModalVisible(false);

    // Show success toast
    toast.success('Edit was successful!', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
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
                  <div className="header-with-icon">
                    {col.title}
                    {['Site Name', 'Location', 'Deposit Type'].includes(col.title) && (
                      <EditOutlined
                        className="edit-icon-header"
                        onClick={() => handleEditClick(editingRowId as number, col.title)}
                      />
                    )}
                  </div>
                  {index < columns.length - 1 && (
                    <div
                      style={{
                        cursor: 'col-resize',
                        padding: '0 5px',
                        userSelect: 'none',
                        width: '15px',
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onMouseDown={(e) => handleMouseDown(index, e)}
                    >
                      ⟷
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {detailedData.map((resource, index) => (
              <tr key={resource.id}>
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

      {/* Edit Modal */}
      <EditModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        options={detailedData}
        title={modalTitle}
        onSave={handleSaveChanges}
      />
    </div>
  );
};

export default DetailedView;
