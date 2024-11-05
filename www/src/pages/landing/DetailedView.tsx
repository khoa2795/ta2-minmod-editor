import React, { useState, useEffect } from "react";
import { EditOutlined } from "@ant-design/icons";
import "./DetailedView.css";
import EditModal from "./EditModal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MineralSite, MineralSiteProperty } from "../../models/MineralSite";
import { Reference } from "../../models/Reference";
import { mineralSiteStore } from "../../stores/MineralSiteStore";

interface DetailedViewProps {
  allMsFields: string[];
  username: string;
  onClose: () => void;
}

const DetailedView: React.FC<DetailedViewProps> = ({
  allMsFields,
  username,
  onClose,
}) => {
  const [columns, setColumns] = useState([
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
    { title: "Comments", width: 150 }, // New comments column
    { title: "Source", width: 100 },
  ]);

  const [detailedData, setDetailedData] = useState<MineralSite[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [depositTypes, setDepositTypes] = useState<string[]>([]);
  const [firstSiteData, setFirstSiteData] = useState<any>(null);
  const [createdRecordUri, setCreatedRecordUri] = useState<string | null>(null);
  const [referenceOptions, setReferenceOptions] = useState<string[]>([]);
  const [property, setProperty] = useState<MineralSiteProperty | null>(null);

  useEffect(() => {
    const fetchDepositTypes = async () => {
      const response = await fetch("/get_deposit_types");
      const data = await response.json();
      setDepositTypes(data.deposit_types || []);
    };
    fetchDepositTypes();
  }, []);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      const mineralSites = await Promise.all(
        allMsFields.map(async (msField, index) => {
          return await mineralSiteStore.getByURI(msField);
        })
      );

      const validDetails = mineralSites;
      setDetailedData(validDetails as MineralSite[]);
      setLoading(false);

      // TODO: fix me!
      const allReferences = validDetails.flatMap((item) =>
        item === null
          ? "Unknown"
          : item.reference[0].document.title || "Unknown"
      );
      setReferenceOptions(allReferences);
    };
    fetchDetails();
  }, [allMsFields]);

  const handleEditClick = async (rowId: number, title: string) => {
    setEditingRowId(rowId);
    setModalTitle(title);
    setModalVisible(true);

    // Set a default value for propertyKey to avoid it being unassigned
    let propertyKey: MineralSiteProperty = "name";  // Default to "name"
    let options: string[] = [];

    // Update propertyKey and options based on the title
    if (title === "Site Name") {
        propertyKey = "name";
        options = detailedData.map(site => site.name);
    } else if (title === "Location") {
        propertyKey = "location";
        options = detailedData.map(site => site.locationInfo.location || "");
    } else if (title === "Deposit Type") {
        propertyKey = "depositType";
        options = detailedData.map(site => site.depositTypeCandidate[0]?.observed_name || "");
    }

    // Set the determined property and options
    setProperty(propertyKey);
    setReferenceOptions(options);

    if (allMsFields.length > 0) {
        const firstResource_id = allMsFields[0].split("resource/")[1];
        const site = await mineralSiteStore.getById(firstResource_id);
        setFirstSiteData(site);
    }
};


const handleSaveChanges = async (
  property: MineralSiteProperty,
  property_value: string,
  reference: Reference
) => {
  console.log("handleSaveChanges called with:", { property, property_value, reference });

  const sessionId = localStorage.getItem("session_id");
  if (!sessionId) {
    toast.error("Session ID not found. Please log in again.");
    return;
  }

  try {
    const curatedMineralSite = MineralSite.createDefaultCuratedMineralSite(detailedData, username)
      .update(property, property_value, reference);
      console.log("curatedMineralSite:", JSON.stringify(curatedMineralSite, null, 2));

    // Try creating the mineral site
    const createResponse = await fetch("/submit_mineral_site", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `session=${sessionId}`,
      },
      body: JSON.stringify(curatedMineralSite.serialize()),
      credentials: "include",
    });

    if (createResponse.ok) {
      const responseData = await createResponse.json();
      toast.success("Data submitted successfully");

      setDetailedData((prevData) => [...prevData, curatedMineralSite]);
    } else if (createResponse.status === 403) {
      // Site already exists, so update instead
      console.log("Resource already exists. Attempting to update.");

      const existingResource_id = createdRecordUri;
      console.log("existingResource_id",existingResource_id)
      const updateResponse = await fetch(`/test/api/v1/mineral-sites/${existingResource_id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session=${sessionId}`,
        },
        body: JSON.stringify(curatedMineralSite.serialize()),
        credentials: "include",
      });

      if (updateResponse.ok) {
        toast.success("Data updated successfully");

        setDetailedData((prevData) =>
          prevData.map((item) =>
            item.record_id === curatedMineralSite.record_id
              ? curatedMineralSite
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

  console.log("@@@", detailedData);
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
                <th
                  key={index}
                  style={{ width: col.width, position: "relative" }}
                >
                  <div className="header-with-icon">
                    {col.title}
                    {["Site Name", "Location", "Deposit Type"].includes(
                      col.title
                    ) && (
                      <EditOutlined
                        className="edit-icon-header"
                        onClick={() =>
                          handleEditClick(editingRowId as number, col.title)
                        }
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
                <td>{resource.name || ""}</td>
                <td>{resource.locationInfo.location || ""}</td>
                <td>{resource.locationInfo.crs?.observed_name || ""}</td>
                <td>{resource.locationInfo.country[0]?.observed_name || ""}</td>
                <td>
                  {resource.locationInfo.state_or_province[0]?.observed_name ||
                    ""}
                </td>
                <td>
                  {resource.locationInfo.state_or_province[0]?.observed_name ||
                    ""}
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
                  {resource.reference[0]?.document.title ||
                    resource.reference[0]?.document.uri ||
                    ""}
                </td>
                <td></td> {/* New comments column */}
                <td>
                  {resource.source_id ? (
                    <a
                      href={resource.source_id}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
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
        mineralSites={detailedData}
        propertyReadableName={modalTitle}
        property={"name"} // TODO: fix me!
        depositTypes={depositTypes}
        onSave={handleSaveChanges}
        referenceOptions={referenceOptions} // Pass reference options
      />
    </div>
  );
};

export default DetailedView;
