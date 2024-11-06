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
  commodity: string;
}

const DetailedView: React.FC<DetailedViewProps> = ({ allMsFields, username, onClose, commodity }) => {
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
  const [toggle, setToggle] = useState();
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
      console.log("allMsFields",allMsFields)

      const validDetails = mineralSites;
      console.log("validation",validDetails)
      setDetailedData(validDetails as MineralSite[]);
      setLoading(false);

      // TODO: fix me!
      const allReferences = validDetails.flatMap((item) => (item === null ? "Unknown" : item.reference[0].document.title || "Unknown"));
      setReferenceOptions(allReferences);
    };
    fetchDetails();
  }, [allMsFields]);

  const handleEditClick = async (rowId: number, title: string) => {
    setEditingRowId(rowId);
    setModalTitle(title);
    setModalVisible(true);

    // Define the propertyKey and options based on the title
    let propertyKey: MineralSiteProperty = "name";
    let options: string[] = [];

    if (title === "Site Name") {
      propertyKey = "name";
      setProperty(propertyKey);
      options = detailedData.map((site) => site.name);
    } else if (title === "Location") {
      propertyKey = "location";
      setProperty(propertyKey);
      options = detailedData.map((site) => site.locationInfo.location || "");
    } else if (title === "Deposit Type") {
      propertyKey = "depositType";
      setProperty("depositType");
      options = depositTypes; // Use depositTypes directly here
    }

    // Set the determined property and reference options
    setReferenceOptions(options);

    if (allMsFields.length > 0) {
      const firstResource_id = allMsFields[0].split("resource/")[1];
      const site = await mineralSiteStore.getById(firstResource_id);
      setFirstSiteData(site);
    }
  };
  console.log("firstsitedata", firstSiteData);
  console.log("chosen value", property);




  const handleSaveChanges = async (property: MineralSiteProperty, property_value: string, reference: Reference) => {
    console.log("handleSaveChanges called with:", { property, property_value, reference });
  
    const sessionId = localStorage.getItem("session_id");
    if (!sessionId) {
      toast.error("Session ID not found. Please log in again.");
      return;
    }
  
    try {
      const curatedMineralSite = MineralSite.createDefaultCuratedMineralSite(detailedData, username).update(property, property_value, reference);
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
  
        const newResourceId = responseData.uri.split("resource/")[1];
        setCreatedRecordUri(newResourceId);
        setDetailedData((prevData) => [
          ...prevData,
          {
            ...curatedMineralSite,
            id: newResourceId,
            reference: reference,
            comments: property_value 
          } as unknown as MineralSite,
        ]);      } else if (createResponse.status === 403) {
        console.log("Resource already exists. Attempting to update.");
  
        const updateResponse = await fetch(`/test/api/v1/mineral-sites/${createdRecordUri}`, {
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
  
          // Update only the specific entry in detailedData with the new property and value
          setDetailedData((prevData) =>
          prevData.map((item) =>
            item.id === createdRecordUri
              ? {
                ...curatedMineralSite,
                id: createdRecordUri,
                reference: reference,
                comments: property_value  
              } as unknown as MineralSite
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
                <th key={index} style={{ width: col.width, position: "relative" }}>
                  <div className="header-with-icon">
                    {col.title}
                    {["Site Name", "Location", "Deposit Type"].includes(col.title) && <EditOutlined className="edit-icon-header" onClick={() => handleEditClick(editingRowId as number, col.title)} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {detailedData.map((resource,index) => (
              <tr key={`${resource.id}_${index}`}>                <td>{resource.name || ""}</td>
                <td>{resource.locationInfo.location || ""}</td>
                <td>{resource.locationInfo.crs?.observed_name || ""}</td>
                <td>{resource.locationInfo.country[0]?.observed_name || ""}</td>
                <td>{resource.locationInfo.state_or_province[0]?.observed_name || ""}</td>
                <td>{commodity}</td>
                <td>{resource.depositTypeCandidate[0]?.observed_name || ""}</td>
                <td>{resource.depositTypeCandidate[0]?.confidence || ""}</td>
                <td>{resource.max_grade ? resource.max_grade[0].toFixed(5) : "0.00000"}</td>
                <td>{resource.max_tonnes ? resource.max_tonnes[0].toFixed(5) : "0.00000"}</td>
                <td>{resource.reference[0]?.document.title || resource.reference[0]?.document.uri || ""}</td>
                <td></td> {/* New comments column */}
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
        mineralSites={detailedData}
        propertyReadableName={modalTitle}
        property={property || "name"} // TODO: fix me!
        depositTypes={depositTypes}
        onSave={handleSaveChanges}
        referenceOptions={referenceOptions} // Pass reference options
      />
    </div>
  );
};

export default DetailedView;
