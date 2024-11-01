import React, { useState, useEffect } from "react";
import { Modal, Input, Button, message } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import EditableDropdown from "../../components/editableDropDown";
import { MineralSite, MineralSiteProperty } from "../../models/MineralSite";
import { Reference } from "../../models/Reference";

interface EditModalProps {
  visible: boolean;
  onClose: () => void;
  mineralSites: MineralSite[];
  propertyReadableName: string;
  property: MineralSiteProperty;
  depositTypes: string[];
  onSave: (property: MineralSiteProperty, value: string, reference: Reference) => void;
  referenceOptions: string[];
}

const EditModal: React.FC<EditModalProps> = ({ visible, onClose, mineralSites, propertyReadableName, property, depositTypes, onSave, referenceOptions }) => {
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [newReference, setNewReference] = useState<string>("");
  const [comments, setComments] = useState<string>("");

  const predefinedPropertyValues = mineralSites.map((site) => site.getProperty(property));
  const referenceOptionsList = referenceOptions;

  // TODO: fix me!
  useEffect(() => {
    if (selectedValue !== null) {
      const selectedSite = mineralSites.find((site) => site.getProperty(property) === selectedValue);
      if (selectedSite) {
        setEditValue(selectedSite.siteName || "");
        // TODO: fix me!! this is incorrect.
        setNewReference(selectedSite.reference[0].document.title || selectedSite.reference[0].document.uri);
      }
    }
  }, [selectedValue, mineralSites]);

  const handleSave = () => {
    if (!newReference.trim()) {
      message.error("Reference is required before saving.");
      return;
    }

    onSave(property, editValue, {
      document: {
        title: newReference,
        uri: "",
      },
      comment: comments,
      pageInfo: [],
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      title={`Edit ${propertyReadableName}`}
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
    >
      <div style={{ marginBottom: "20px" }}>
        <span>{propertyReadableName}:</span>
        <div style={{ display: "flex", alignItems: "center", marginTop: "8px" }}>
          <EditableDropdown options={predefinedPropertyValues} onSave={setEditValue} />
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <span>Reference:</span>
        <div style={{ display: "flex", alignItems: "center", marginTop: "8px" }}>
          <EditableDropdown options={referenceOptionsList} onSave={setNewReference} />
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <span>Comments:</span>
        <Input.TextArea value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Enter comments" style={{ marginTop: "8px", width: "100%" }} />
      </div>
    </Modal>
  );
};

export default EditModal;
