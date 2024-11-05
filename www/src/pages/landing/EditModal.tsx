import React, { useState } from "react";
import { Modal, Input, Button, message } from "antd";
import { MineralSite, MineralSiteProperty } from "../../models/MineralSite";
import { Reference } from "../../models/Reference";
import { NewEditableDropdown } from "../../components/NewEditableDropdown";

interface EditModalProps {
  visible: boolean;
  onClose: () => void;
  mineralSites: MineralSite[];
  propertyReadableName: string;
  property: MineralSiteProperty;
  depositTypes: string[];
  onSave: (
    property: MineralSiteProperty,
    value: string,
    reference: Reference
  ) => void;
  referenceOptions: string[];
}

const EditModal: React.FC<EditModalProps> = ({
  visible,
  onClose,
  mineralSites,
  propertyReadableName,
  property,
  depositTypes,
  onSave,
  referenceOptions,
}) => {
  const [editValue, setEditValue] = useState<string>("");
  const [newReference, setNewReference] = useState<string>("");
  const [comments, setComments] = useState<string>("");

  const updateProvenance = (key: string | null) => {
    if (key !== null) {
      // Set reference to one of the mineral sites
      const selectedSite = mineralSites[parseInt(key)];
      setNewReference(
        selectedSite.reference[0]?.document.title ||
        selectedSite.reference[0]?.document.uri ||
        "Unknown"
      );
    } else {
      // Create new value -- allow user to enter a custom reference
      setNewReference("");
    }
  };

  const handleSave = () => {
    if (!newReference.trim()) {
      message.error("Reference is required before saving.");
      return;
    }
    console.log("Saving with property:", property);
    console.log("Saving with editValue:", editValue);
    console.log("Saving with reference:", newReference);
  
    // Call onSave and pass parameters
    onSave(
      property,
      editValue,
      new Reference({
        document: {
          title: newReference,
          uri: "",
        },
        comment: comments,
      })
    );
    onClose();
  };
  

  return (
    <Modal
      visible={visible}
      title={<span style={{ fontSize: "18px", fontWeight: "bold" }}>Edit {propertyReadableName}</span>}
      onOk={handleSave}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>Cancel</Button>,
        <Button key="save" type="primary" onClick={handleSave}>Save</Button>,
      ]}
      bodyStyle={{ padding: "20px" }}
      centered
    >
      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontWeight: "bold", display: "block", marginBottom: "8px" }}>
          {propertyReadableName}:
        </label>
        <div style={{ position: "relative", width: "100%" }}>
          <NewEditableDropdown
            value={editValue}
            onChange={setEditValue}
            onProvenanceChange={updateProvenance}
            options={referenceOptions.map((value, index) => ({
              key: index.toString(),
              label: value,
            }))}
          />
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontWeight: "bold", display: "block", marginBottom: "8px" }}>
          Reference:
        </label>
        <div style={{ position: "relative", width: "100%" }}>
          <NewEditableDropdown
            value={newReference}
            onChange={setNewReference}
            onProvenanceChange={(key: string | null) => {
              // Do nothing as update reference doesn’t trigger anything additional
            }}
            options={mineralSites.map((site, index) => ({
              key: index.toString(),
              label: site.reference[0]?.document.title || site.reference[0]?.document.uri || "Unknown",
            }))}
          />
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontWeight: "bold", display: "block", marginBottom: "8px" }}>
          Comments:
        </label>
        <Input.TextArea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Enter comments"
          style={{ width: "100%" }}
          rows={4}
        />
      </div>
    </Modal>
  );
};

export default EditModal;
