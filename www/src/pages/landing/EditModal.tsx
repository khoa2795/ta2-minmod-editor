import React, { useState, useEffect } from "react";
import { Modal, Input, Button, message } from "antd";
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
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [newReference, setNewReference] = useState<string>("");
  const [comments, setComments] = useState<string>("");

  const predefinedPropertyValues = mineralSites.map((site) =>
    site.getProperty(property)
  );

  useEffect(() => {
    if (selectedValue !== null) {
      const selectedSite = mineralSites.find(
        (site) => site.getProperty(property) === selectedValue
      );
      if (selectedSite) {
        setEditValue(selectedSite.name || "");
        setNewReference(
          selectedSite.reference[0].document.title ||
          selectedSite.reference[0].document.uri
        );
      }
    }
  }, [selectedValue, mineralSites]);

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
      title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>Edit {propertyReadableName}</span>}
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
      bodyStyle={{ padding: '20px' }}
      centered
    >
      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>{propertyReadableName}:</label>
        <div style={{ width: '100%' }}>
          <EditableDropdown
            options={predefinedPropertyValues}
            onSave={setEditValue}
          />
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Reference:</label>
        <div style={{ width: '100%' }}>
          <EditableDropdown
            options={referenceOptions}
            onSave={setNewReference}
          />
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Comments:</label>
        <Input.TextArea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Enter comments"
          style={{ width: '100%' }}
          rows={4}
        />
      </div>
    </Modal>
  );
};

export default EditModal;
