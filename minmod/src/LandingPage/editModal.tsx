import React, { useState, useEffect } from 'react';
import { Modal, Input, Select, Button, message } from 'antd';

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
  const [selectedRowId, setSelectedRowId] = useState<number>(options.length > 0 ? options[0].id : 0);
  const [newValue, setNewValue] = useState<string>('');
  const [newReference, setNewReference] = useState<string>('');

  useEffect(() => {
    const selectedOption = options.find((opt) => opt.id === selectedRowId);
    if (selectedOption) {
      setNewValue(title.toLowerCase() === 'site name' ? selectedOption.siteName : selectedOption.location);
      setNewReference('');
    }
  }, [selectedRowId, options, title]);

  const handleSave = () => {
    if (!newReference.trim()) {
      message.error('Reference is required before saving.');
      return;
    }

    const newRow: ResourceDetails = {
      id: Math.random(),
      siteName: title.toLowerCase() === 'site name' ? newValue : '',
      location: title.toLowerCase() === 'location' ? newValue : '',
      depositType: title.toLowerCase() === 'deposit type' ? newValue : '',
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

  const openMapView = () => {
    // Replace with the actual coordinates if you have them or parse the input
    const location = newValue.replace(/^POINT\(|\)$/g, '').trim(); // Assuming input format "POINT(lon lat)"
    const [longitude, latitude] = location.split(' ');
    window.open(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`, '_blank');
  };

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
        <span>Select {title}:</span>
        <Select<number>
          showSearch
          value={selectedRowId}
          onChange={setSelectedRowId}
          style={{ width: '100%', marginTop: '8px' }}
        >
          {options.map((option) => (
            <Select.Option key={option.id} value={option.id}>
              {title.toLowerCase() === 'site name'
                ? `${option.id}: ${option.siteName}`
                : title.toLowerCase() === 'location'
                ? `${option.id}: ${option.location}`
                : `${option.id}: ${option.depositType}`}
            </Select.Option>
          ))}
        </Select>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <span>{title === 'Deposit Type' ? 'Select Deposit Type:' : `Enter ${title}:`}</span>
        {title === 'Deposit Type' ? (
          <Select
            placeholder="Select deposit type"
            style={{ width: '100%', marginTop: '8px' }}
            onChange={setNewValue}
          >
            {depositTypes.map((type) => (
              <Select.Option key={type} value={type}>
                {type}
              </Select.Option>
            ))}
          </Select>
        ) : (
          <Input
            placeholder={title === 'Site Name' ? 'Enter site name' : 'Enter location'}
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            style={{ marginTop: '8px' }}
          />
        )}
        {title.toLowerCase() === 'location' && (
          <Button type="primary" onClick={openMapView} style={{ marginTop: '10px' }}>
            View Map
          </Button>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <span>Edit Reference:</span>
        <Input
          placeholder="Enter reference"
          value={newReference}
          onChange={(e) => setNewReference(e.target.value)}
          style={{ marginTop: '8px' }}
        />
      </div>
    </Modal>
  );
};

export default EditModal;
