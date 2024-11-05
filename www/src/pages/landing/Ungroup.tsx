import React, { useState, useEffect } from "react";
import { Checkbox } from "antd";
import "./DetailedView.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MineralSite } from "../../models/MineralSite";
import { mineralSiteStore } from "../../stores/MineralSiteStore";

interface UngroupProps {
  allMsFields: string[];
  onClose: () => void;
}

const Ungroup: React.FC<UngroupProps> = ({ allMsFields, onClose }) => {
  const [columns, setColumns] = useState([
    { title: "Select", width: 45 },
    { title: "Site Name", width: 150 },
    { title: "Location", width: 120 },
    { title: "CRS", width: 80 },
    { title: "Country", width: 100 },
    { title: "State/Province", width: 100 },
    { title: "Commodity", width: 100 },
    { title: "Deposit Type", width: 120 },
    { title: "Deposit Confidence", width: 120 },
    { title: "Grade", width: 80 },
    { title: "Tonnage", width: 80 },
    { title: "Reference", width: 100 },
    { title: "Comments", width: 150 },
    { title: "Source", width: 100 },
  ]);

  const [detailedData, setDetailedData] = useState<MineralSite[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState<{ [key: string]: boolean }>({}); // Track selection state per row using an object

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      const mineralSites = await Promise.all(
        allMsFields.map(async (msField) => {
          const resourceId = msField.split("resource/")[1];
          return await mineralSiteStore.getById(resourceId);
        })
      );

      const validDetails = mineralSites.filter((site) => site !== null) as MineralSite[];
      setDetailedData(validDetails);
      setLoading(false);
    };

    fetchDetails();
  }, [allMsFields]);

  // Toggle selection for a row
  const handleCheckboxChange = (id: string) => {
    setSelectedRows((prevSelected) => ({
      ...prevSelected,
      [id]: !prevSelected[id], // Toggle the selection state of the specific row
    }));
  };

  return (
    <div className="detailed-view-container">
      <ToastContainer />
      <div className="detailed-view-header">
        <span>Ungrouped View</span>
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
                <th
                  key={index}
                  style={{ width: col.width, position: "relative" }}
                >
                  <div>{col.title}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {detailedData.map((resource) => (
              <tr key={resource.id}>
                <td>
                  <Checkbox
                    checked={!!selectedRows[resource.id]} // Convert to boolean and use its state
                    onChange={() => handleCheckboxChange(resource.id)}
                  />
                </td>
                <td>{resource.name || ""}</td>
                <td>{resource.locationInfo.location || ""}</td>
                <td>{resource.locationInfo.crs?.observed_name || ""}</td>
                <td>{resource.locationInfo.country[0]?.observed_name || ""}</td>
                <td>{resource.locationInfo.state_or_province[0]?.observed_name || ""}</td>
                <td>
                  {(resource as any).mineral_inventory?.[0]?.commodity?.observed_name || ""}
                </td>
                <td>{resource.depositTypeCandidate[0]?.observed_name || ""}</td>
                <td>{resource.depositTypeCandidate[0]?.confidence || ""}</td>
                <td>
                  {resource.max_grade !== undefined ? resource.max_grade : ""}
                </td>
                <td>
                  {resource.max_tonnes !== undefined ? resource.max_tonnes : ""}
                </td>
                <td>
                  {resource.reference[0]?.document.title || resource.reference[0]?.document.uri || ""}
                </td>
                <td></td> {/* Placeholder for Comments column */}
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
    </div>
  );
};

export default Ungroup;
