import React, { useState, useEffect } from "react";
import { Modal, Input, Button, message } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import EditableDropdown from "../../components/editableDropDown";
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

  const predefinedPropertyValues = mineralSites.map((site) =>
    site.getProperty(property)
  );
  const predefinedReferenceValues = mineralSites.map(
    (site) => site.reference[0].document.title || site.reference[0].document.uri
  );

  const updateProvenance = (key: string | null) => {
    if (key !== null) {
      // set reference to one of the site
      const selectedSite = mineralSites[parseInt(key)];
      setNewReference(
        selectedSite.reference[0].document.title ||
          selectedSite.reference[0].document.uri
      );
    } else {
      // create new value -- enter your own reference
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

  return (
    <Modal
      visible={visible}
      title={
        <span style={{ fontSize: "18px", fontWeight: "bold" }}>
          Edit {propertyReadableName}
        </span>
      }
      onOk={handleSave}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          Save
        </Button>,
      ]}
      bodyStyle={{ padding: "20px" }}
      centered
    >
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{ fontWeight: "bold", display: "block", marginBottom: "8px" }}
        >
          {propertyReadableName}:
        </label>
        <div style={{ position: "relative", width: "100%" }}>
          <NewEditableDropdown
            value={editValue}
            onChange={setEditValue}
            onProvenanceChange={(key: string | null) => {
              updateProvenance(key);
            }}
            options={predefinedPropertyValues.map((value, index) => ({
              key: index.toString(),
              label: value,
            }))}
          />
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label
          style={{ fontWeight: "bold", display: "block", marginBottom: "8px" }}
        >
          Reference:
        </label>
        <div style={{ position: "relative", width: "100%" }}>
          <NewEditableDropdown
            value={newReference}
            onChange={setNewReference}
            onProvenanceChange={(key: string | null) => {
              // do nothing as update reference doesn't trigger anything
            }}
            options={predefinedReferenceValues.map((value, index) => ({
              key: index.toString(),
              label: value,
            }))}
          />
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label
          style={{ fontWeight: "bold", display: "block", marginBottom: "8px" }}
        >
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
