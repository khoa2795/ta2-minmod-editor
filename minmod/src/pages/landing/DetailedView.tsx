import React, { useState, useEffect } from 'react';
import { EditOutlined } from '@ant-design/icons';
import './DetailedView.css';
import EditModal from './editModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {MineralSite} from '../../models/MineralSite'


interface DetailedViewProps {
  allMsFields: string[];
  username: string;
  onClose: () => void;
}

const DetailedView: React.FC<DetailedViewProps> = ({ allMsFields, username, onClose }) => {
  const [columns, setColumns] = useState([
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
    { title: 'Comments', width: 150 }, // New comments column
    { title: 'Source', width: 100 },
  ]);

  const [detailedData, setDetailedData] = useState<MineralSite[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [depositTypes, setDepositTypes] = useState<string[]>([]);
  const [firstSiteData, setFirstSiteData] = useState<any>(null);
  const [createdRecordUri, setCreatedRecordUri] = useState<string | null>(null); 
  const [referenceOptions, setReferenceOptions] = useState<string[]>([]);

  useEffect(() => {
    const fetchDepositTypes = async () => {
      const response = await fetch('http://localhost:8000/get_deposit_types');
      const data = await response.json();
      setDepositTypes(data.deposit_types || []);
    };
    fetchDepositTypes();
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
            console.log("result", result);
            return { ...result.data, id: index + 1 };
          }
          return null;
        })
      );

      const validDetails = details.filter((detail) => detail !== null);
      setDetailedData(validDetails as MineralSite[]);
      setLoading(false);

      const allReferences = validDetails.map((item) => item.reference || 'Unknown');
      setReferenceOptions(allReferences);
    };
    fetchDetails();
  }, [allMsFields]);

  const handleEditClick = async (rowId: number, title: string) => {
    setEditingRowId(rowId);
    setModalTitle(title);
    setModalVisible(true);

    if (allMsFields.length > 0) {
      const firstResourceId = allMsFields[0].split("resource/")[1];
      console.log("firstResourceId", firstResourceId);

      try {
        const response = await fetch(`http://127.0.0.1:8000/get_site_info/${firstResourceId}`);
        if (response.ok) {
          const result = await response.json();
          if (result.data) {
            setFirstSiteData(result.data);
          } else {
            toast.error("No data received from site information API.");
          }
        } else {
          toast.error("Failed to fetch site information. Server responded with an error.");
        }
      } catch (error) {
        console.error("Error fetching site information:", error);
        toast.error("Failed to fetch site information due to network error.");
      }
    }
  };

  const handleSaveChanges = async (newRow: MineralSite) => {
    const sessionId = localStorage.getItem('session_id');
    if (!sessionId) {
      toast.error("Session ID not found. Please log in again.");
      return;
    }

    if (!firstSiteData || !firstSiteData.location_info) {
      toast.error("Site data is incomplete or not loaded.");
      return;
    }

    const source_id = `${firstSiteData.source_id || ""}?username=${username}`;
    const modifiedAt = new Date().toISOString();
    const payload = {
      source_id: source_id,
      record_id: String(firstSiteData.record_id) || "",
      name: newRow.siteName || firstSiteData.name || "",
      location_info: {
        location: firstSiteData.location_info.location || "",
        crs: {
          normalized_uri: firstSiteData.location_info.crs?.normalized_uri || "",
          confidence: firstSiteData.location_info.crs?.confidence || 0,
          source: firstSiteData.location_info.crs?.source || ""
        },
        country: firstSiteData.location_info.country
          ? [{
            normalized_uri: firstSiteData.location_info.country.normalized_uri || "",
            observed_name: firstSiteData.location_info.country.observed_name || "",
            confidence: firstSiteData.location_info.country.confidence || 0,
            source: firstSiteData.location_info.country.source || ""
          }]
          : [],
        state_or_province: firstSiteData.location_info.state_or_province
          ? [{
            normalized_uri: firstSiteData.location_info.state_or_province.normalized_uri || "",
            observed_name: firstSiteData.location_info.state_or_province.observed_name || "",
            confidence: firstSiteData.location_info.state_or_province.confidence || 0,
            source: firstSiteData.location_info.state_or_province.source || ""
          }]
          : []
      },
      mineral_inventory: firstSiteData.mineral_inventory
        ? [{
          commodity: firstSiteData.mineral_inventory.commodity || "Unknown",
          grade: firstSiteData.mineral_inventory.grade || "0.00000000",
          tonnage: firstSiteData.mineral_inventory.tonnage || "0",
          reference: firstSiteData.mineral_inventory.reference || "Unknown",
          source: firstSiteData.mineral_inventory.source || "Unknown"
        }]
        : [],
      deposit_type_candidate: Array.isArray(firstSiteData.deposit_type_candidate)
        ? firstSiteData.deposit_type_candidate.map((item: any) => ({
          observed_name: item?.observed_name || "",
          normalized_uri: item?.normalized_uri || "",
          source: item?.source || "",
          confidence: item?.confidence || 0
        }))
        : [],
      modified_at: modifiedAt,
      reference: Array.isArray(firstSiteData.reference) ? firstSiteData.reference : [],
      created_by: "https://minmod.isi.edu/users/inferlink",
      same_as: Array.isArray(firstSiteData.same_as) ? firstSiteData.same_as : []
    };

    console.log("Constructed Payload:", JSON.stringify(payload, null, 2));

    try {
      const createResponse = await fetch("http://localhost:8000/submit_mineral_site", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cookie": `session=${sessionId}`,
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (createResponse.ok) {
        const responseData = await createResponse.json();
        const newRecordUri = responseData.uri;
        const resourceId = newRecordUri.split("resource/")[1];
        setCreatedRecordUri(resourceId);
        toast.success("Data submitted successfully");

        setDetailedData((prevData) => [
          ...prevData,
          {
            id: prevData.length + 1,
            record_id: payload.record_id,
            siteName: newRow.siteName || firstSiteData?.name || "",
            location: newRow.location || firstSiteData?.location_info?.location || "",
            crs: newRow.crs || firstSiteData?.location_info?.crs?.normalized_uri || "",
            country: newRow.country || firstSiteData?.location_info?.country?.observed_name || "",
            state_or_province: newRow.state_or_province || firstSiteData?.location_info?.state_or_province?.observed_name || "",
            commodity: newRow.commodity || firstSiteData?.mineral_inventory?.commodity || "Unknown",
            depositType: newRow.depositType || firstSiteData?.deposit_type_candidate?.depositType || "Unknown",
            depositConfidence: newRow.depositConfidence || firstSiteData?.deposit_type_candidate?.depositConfidence || "0",
            grade: newRow.grade || firstSiteData?.mineral_inventory?.grade || "0.00000000",
            tonnage: newRow.tonnage || firstSiteData?.mineral_inventory?.tonnage || "0",
            reference: newRow.reference || firstSiteData?.mineral_inventory?.reference || "Unknown",
            comments: newRow.comments || "", // New comments field
            source_id: newRow.source_id || firstSiteData?.mineral_inventory?.source || "Unknown"
          }
        ]);
      } else if (createResponse.status === 403) {
        // Site already exists: Update instead
        console.log("Site already exists. Proceeding to update.");
        const existingResourceId = createdRecordUri;

        const updateResponse = await fetch(`http://localhost:8000/test/api/v1/mineral-sites/${existingResourceId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cookie": `session=${sessionId}`,
          },
          body: JSON.stringify(payload),
          credentials: "include",
        });

        if (updateResponse.ok) {
          toast.success("Data updated successfully");

          setDetailedData((prevData) =>
            prevData.map((item) =>
              item.record_id === payload.record_id
                ? {
                  ...item,
                  siteName: newRow.siteName || item.siteName,
                  location: newRow.location || item.location,
                  depositType: newRow.depositType || item.depositType,
                  reference: newRow.reference || item.reference,
                  comments: newRow.comments || item.comments, // Update comments
                }
                : item
            )
          );
        } else {
          const errorData = await updateResponse.json();
          toast.error(`Update failed: ${errorData.detail}`);
        }
      } else {
        const errorData = await createResponse.json();
        toast.error(`Error: ${errorData.detail}`);
      }
    } catch (error) {
      toast.error("Failed to submit data.");
    }

    setModalVisible(false);
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
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {detailedData.map((resource) => (
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
                <td>{resource.comments}</td> {/* New comments column */}
                <td>
                  {resource.source_id ? (
                    <a href={resource.source_id} target="_blank" rel="noopener noreferrer">
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
      <EditModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        options={detailedData}
        title={modalTitle}
        depositTypes={depositTypes}
        onSave={handleSaveChanges}
        referenceOptions={referenceOptions} // Pass reference options
      />
    </div>
  );
};

export default DetailedView;
