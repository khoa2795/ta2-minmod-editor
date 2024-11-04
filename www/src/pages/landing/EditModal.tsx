import React, { useState, useEffect } from "react";
import { Modal, Input, Button, message } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
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
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isEditingReference, setIsEditingReference] = useState<boolean>(false);

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
        setIsEditing(true);
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
    setIsEditing(false);
    setIsEditingReference(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedValue(null);
    setEditValue("");
  };

  const handleCancelReferenceEdit = () => {
    setIsEditingReference(false);
    setNewReference("");
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
        <div style={{ position: "relative", width: "100%" }}>
          {isEditing ? (
            <>
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder={`Edit ${propertyReadableName}`}
                style={{ width: '100%' }}
              />
              <CloseCircleOutlined
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
                onClick={handleCancelEdit}
              />
            </>
          ) : (
            <EditableDropdown
              options={predefinedPropertyValues}
              onSave={(value) => {
                setSelectedValue(value);
                setIsEditing(true);
              }}
            />
          )}
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Reference:</label>
        <div style={{ position: "relative", width: "100%" }}>
          {isEditingReference ? (
            <>
              <Input
                value={newReference}
                onChange={(e) => setNewReference(e.target.value)}
                placeholder="Edit Reference"
                style={{ width: '100%' }}
              />
              <CloseCircleOutlined
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
                onClick={handleCancelReferenceEdit}
              />
            </>
          ) : (
            <EditableDropdown
              options={referenceOptions}
              onSave={(value) => {
                setNewReference(value);
                setIsEditingReference(true);
              }}
            />
          )}
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

