import React, { useState, useEffect } from 'react';
import { Modal, Input, Select, Button, message, TreeSelect } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

interface ResourceDetails {
  id: number;
  siteName: string;
  location: string;
  depositType: string;
  reference?: string;
  crs: string;
  country: string;
  state_or_province: string;
  commodity: string;
  depositConfidence: string;
  grade: string;
  tonnage: string;
}

interface EditModalProps {
  visible: boolean;
  onClose: () => void;
  options: ResourceDetails[];
  title: string;
  depositTypes: string[];
  onSave: (newRow: ResourceDetails) => void;
}

const EditModal: React.FC<EditModalProps> = ({ visible, onClose, options, title, depositTypes, onSave }) => {
  const [selectedValue, setSelectedValue] = useState<string | null>(null); // Store selected dropdown value
  const [isEditing, setIsEditing] = useState<boolean>(false); // Toggle between dropdown and text input
  const [editValue, setEditValue] = useState<string>(''); // Store edited value
  const [newReference, setNewReference] = useState<string>(''); // Store reference value

  // When the selected value changes, populate the text field with the selected value or allow custom input
  useEffect(() => {
    if (selectedValue !== null && !isEditing) {
      if (selectedValue === 'custom') {
        setEditValue(''); // Clear the field for custom input
        setNewReference(''); // Clear the reference field for custom input
      } else {
        const selectedOption = options.find((opt) => {
          if (title.toLowerCase() === 'site name') return opt.siteName === selectedValue;
          if (title.toLowerCase() === 'location') return opt.location === selectedValue;
          if (title.toLowerCase() === 'deposit type') return opt.depositType === selectedValue;
          return false;
        });
        if (selectedOption) {
          setEditValue(selectedValue); // Auto populate the text field with the selected dropdown value
          setNewReference(selectedOption.reference || ''); // Auto populate the reference field with the selected option's reference
        }
      }
    }
  }, [selectedValue, options, title, isEditing]);

  const handleSave = () => {
    if (!newReference.trim()) {
      message.error('Reference is required before saving.');
      return;
    }

    const newRow: ResourceDetails = {
      id: Math.random(),
      siteName: title.toLowerCase() === 'site name' ? editValue : '',
      location: title.toLowerCase() === 'location' ? editValue : '',
      depositType: title.toLowerCase() === 'deposit type' ? editValue : '',
      reference: newReference,
      crs: '',
      country: '',
      state_or_province: '',
      commodity: '',
      depositConfidence: '',
      grade: '',
      tonnage: ''
    };

    onSave(newRow);
    onClose();
  };

  const handleDropdownChange = (value: string) => {
    setSelectedValue(value);
    if (value === 'custom') {
      setIsEditing(true); // Switch to editing mode for custom input
      setEditValue(''); // Clear input for custom entry
      setNewReference(''); // Clear reference for custom entry
    } else {
      setIsEditing(true); // Switch to editing mode with selected value
      const selectedOption = options.find((opt) => {
        if (title.toLowerCase() === 'site name') return opt.siteName === value;
        if (title.toLowerCase() === 'location') return opt.location === value;
        return false;
      });
      if (selectedOption) {
        setEditValue(value); // Auto populate the input field with the selected value
        setNewReference(selectedOption.reference || 'Unknown'); // Auto populate reference field, default to 'Unknown' if not available
      }
    }
  };

  const handleTreeSelectChange = (value: string) => {
    setEditValue(value); // Update the deposit type when selected from the TreeSelect dropdown

    // Find the selected deposit type in the options and set its reference
    const selectedOption = options.find((opt) => opt.depositType === value);
    if (selectedOption) {
      setNewReference(selectedOption.reference || 'Unknown'); // Auto populate reference with the selected deposit type's reference
    }

    setIsEditing(true); // Switch to editing mode after selection
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  const handleRevertToDropdown = () => {
    setIsEditing(false); // Revert to dropdown mode
    setSelectedValue(null); // Reset selected value
  };

  // Function to open Google Maps with the provided location coordinates
  const openMapView = () => {
    const location = editValue.replace(/^POINT\(|\)$/g, '').trim(); // Assuming input format "POINT(lon lat)"
    const [longitude, latitude] = location.split(' ');
    if (latitude && longitude) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`, '_blank');
    } else {
      message.error('Invalid location format. Please enter coordinates as POINT(lon lat)');
    }
  };

  const treeData = [
    {
      title: 'Current Deposit Types',
      value: 'current',
      key: '0-0',
      children: options.map((option) => ({
        title: option.depositType,
        value: option.depositType,
        key: option.depositType,
      })),
    },
    {
      title: 'All Deposit Types',
      value: 'all',
      key: '0-1',
      children: depositTypes.map((type) => ({
        title: type,
        value: type,
        key: type,
      })),
    },
  ];

  return (
    <Modal
      visible={visible}
      title={`Edit ${title}`}
      onOk={handleSave}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>Cancel</Button>,
        <Button key="save" type="primary" onClick={handleSave}>Save</Button>,
      ]}
    >
      <div style={{ marginBottom: '20px' }}>
        <span>{title}:</span>
        {title.toLowerCase() === 'deposit type' ? (
          !isEditing ? (
<TreeSelect
  showSearch
  style={{ width: '100%' }}
  value={editValue}
  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
  treeData={treeData}
  placeholder="Search and select deposit type"
  treeDefaultExpandAll
  filterTreeNode={(inputValue, treeNode) => {
    const title = treeNode.title as string; // Type assertion for `treeNode.title`
    return title?.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0;
  }}
  onChange={handleTreeSelectChange}
/>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Input
                value={editValue} // Display the selected or custom value in the text field
                onChange={handleEditChange} // Allow editing of the value
                placeholder={`Enter ${title}`}
                style={{ flex: 1, marginTop: '8px' }}
              />
              <Button
                icon={<CloseOutlined />}
                onClick={handleRevertToDropdown}
                style={{ marginLeft: '10px', marginTop: '8px' }}
              />
            </div>
          )
        ) : !isEditing ? (
          <Select
            showSearch
            value={selectedValue} // Current selected dropdown value
            placeholder={`Select ${title}`}
            onChange={handleDropdownChange} // Handle dropdown change
            style={{ width: '100%', marginTop: '8px' }}
          >
            {options.map((option) => (
              <Select.Option key={option.id} value={title.toLowerCase() === 'site name' ? option.siteName : option.location}>
                {title.toLowerCase() === 'site name' ? option.siteName : option.location}
              </Select.Option>
            ))}
            <Select.Option value="custom">Enter data</Select.Option>
          </Select>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Input
              value={editValue} // Display the selected or custom value in the text field
              onChange={handleEditChange} // Allow editing of the value
              placeholder={`Enter ${title}`}
              style={{ flex: 1, marginTop: '8px' }}
            />
            <Button
              icon={<CloseOutlined />}
              onClick={handleRevertToDropdown}
              style={{ marginLeft: '10px', marginTop: '8px' }}
            />
          </div>
        )}
        {title.toLowerCase() === 'location' && (
          <Button
            type="primary"
            onClick={openMapView}
            style={{ marginTop: '10px' }}
          >
            View Map
          </Button>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <span>Edit Reference:</span>
        <Input
          placeholder="Enter reference"
          value={newReference} // Automatically populate reference when option is selected
          onChange={(e) => setNewReference(e.target.value)}
          style={{ marginTop: '8px', width: '100%' }}
        />
      </div>
    </Modal>
  );
};

export default EditModal;