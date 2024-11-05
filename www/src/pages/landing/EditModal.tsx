import React, { useState } from "react";
import { Modal, Input, Button, message, Select } from "antd";
import { MineralSite, MineralSiteProperty } from "../../models/MineralSite";
import { Reference } from "../../models/Reference";
import { NewEditableDropdown } from "../../components/NewEditableDropdown";

const { Option } = Select;

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
      const selectedSite = mineralSites[parseInt(key)];
      setNewReference(
        selectedSite.reference[0]?.document.title ||
        selectedSite.reference[0]?.document.uri ||
        "Unknown"
      );
    } else {
      setNewReference("");
    }
  };

  const handleSave = () => {
    if (!newReference.trim()) {
      message.error("Reference is required before saving.");
      return;
    }
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

  // Determine dropdown options based on the property
  const siteSpecificDepositTypes = mineralSites
    .map((site) => site.depositTypeCandidate[0]?.observed_name || "")
    .filter((type) => type); // Filter out undefined or empty strings

  const dropdownOptions =
    property === "depositType"
      ? Array.from(new Set([...siteSpecificDepositTypes, ...depositTypes])) // Combine site-specific and all deposit types without duplicates
      : property === "name"
      ? mineralSites.map((site) => site.name)
      : property === "location"
      ? mineralSites.map((site) => site.locationInfo.location || "")
      : [];

  // Generate reference options based on mineralSites for consistent behavior
  const consistentReferenceOptions = mineralSites.map((site) => ({
    key: site.id.toString(),
    label: site.reference[0]?.document.title || site.reference[0]?.document.uri || "Unknown",
  }));

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
          {property === "depositType" ? (
            <Select
              showSearch
              value={editValue}
              onChange={setEditValue}
              style={{ width: "100%" }}
              placeholder="Select a deposit type or enter your own"
            >
              {dropdownOptions.map((option, index) => (
                <Option key={index} value={option}>
                  {option}
                </Option>
              ))}
              <Option value="custom">Enter your own</Option>
            </Select>
          ) : (
            <NewEditableDropdown
              value={editValue}
              onChange={setEditValue}
              onProvenanceChange={updateProvenance}
              options={dropdownOptions.map((option, index) => ({
                key: index.toString(),
                label: option,
              }))}
            />
          )}
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontWeight: "bold", display: "block", marginBottom: "8px" }}>
          Reference:
        </label>
        <NewEditableDropdown
          value={newReference}
          onChange={setNewReference}
          onProvenanceChange={(key: string | null) => {}}
          options={consistentReferenceOptions}
        />
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
