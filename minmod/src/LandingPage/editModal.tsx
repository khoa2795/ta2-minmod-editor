import React, { useState, useEffect } from 'react';
import { Modal, Input, Select, Button } from 'antd';

interface TableRow {
  id: number;
  siteName: string;
  location: string;
  depositType: string;
  reference?: string;
  // ... other fields
}

interface EditModalProps {
  visible: boolean;
  onClose: () => void;
  options: TableRow[];
  title: string;
  onSave: (rowId: number, newValue: string, newReference: string) => void;
}

const EditModal: React.FC<EditModalProps> = ({ visible, onClose, options, title, onSave }) => {
  const initialOption = options.length > 0 ? options[0] : null;
  const [selectedRowId, setSelectedRowId] = useState<number>(initialOption?.id || 0);
  const [newValue, setNewValue] = useState<string>('');
  const [newReference, setNewReference] = useState<string>('');

  // Set initial values based on the column being edited
  useEffect(() => {
    const selectedOption = options.find((opt) => opt.id === selectedRowId);
    if (selectedOption) {
      // Separate conditions for siteName, location, and depositType
      if (title.toLowerCase() === 'site name') {
        setNewValue(selectedOption.siteName);
      } else if (title.toLowerCase() === 'location') {
        setNewValue(selectedOption.location);
      } else if (title.toLowerCase() === 'deposit type') {
        setNewValue(selectedOption.depositType);
      }
      setNewReference(selectedOption.reference || '');
    }
  }, [selectedRowId, title, options]);

  const handleSave = () => {
    if (selectedRowId !== -1) {
      onSave(selectedRowId, newValue, newReference);
      onClose();
    }
  };

  const handleDropdownChange = (value: number) => {
    setSelectedRowId(value);
  };

  const openMapView = () => {
    // Parse the coordinates from `newValue`
    const location = newValue.replace(/^POINT\(|\)$/g, '').trim();
    const [longitude, latitude] = location.split(' ');

    // Open the coordinates in Google Maps
    window.open(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`, '_blank');
  };

  return (
    <Modal
      visible={visible}
      title={`Edit ${title}`}
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
      <div style={{ marginBottom: '20px' }}>
        <span>{title}:</span>
        <Select<number>
          showSearch
          value={selectedRowId}
          onChange={handleDropdownChange}
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
        <span>Edit {title}:</span>
        <Input
          placeholder={`Edit ${title.toLowerCase()}`}
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          style={{ marginTop: '8px' }}
        />
        {/* Add "View Map" button for location */}
        {title.toLowerCase() === 'location' && (
          <Button type="primary" onClick={openMapView} style={{ marginTop: '10px', marginLeft: '10px' }}>
            View Map
          </Button>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <span>Edit Reference:</span>
        <Input
          placeholder="Edit reference"
          value={newReference}
          onChange={(e) => setNewReference(e.target.value)}
          style={{ marginTop: '8px' }}
        />
      </div>
    </Modal>
  );
};

export default EditModal;
