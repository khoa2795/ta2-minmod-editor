import React, { useState } from 'react';
import { CloseOutlined } from '@ant-design/icons';

interface EditableDropdownProps {
  options: string[];
  onSave: (value: string) => void;
}

const EditableDropdown: React.FC<EditableDropdownProps> = ({ options, onSave }) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editValue, setEditValue] = useState<string>('');

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue === 'Enter your own') {
      setEditValue(''); // Clear the field if "Enter your own" is selected
      setIsEditing(true);
    } else {
      setSelectedOption(selectedValue);
      setEditValue(selectedValue);
      setIsEditing(false); // Disable editing mode if predefined option is selected
      onSave(selectedValue); // Immediately save selected predefined option
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  const handleCancelEdit = () => {
    setIsEditing(false); // Exit edit mode without saving
    setEditValue(selectedOption); // Reset to the previously selected value
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {isEditing ? (
        <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
          <input
            type="text"
            value={editValue}
            onChange={handleEditChange}
            style={{ flexGrow: 1, padding: '6px', borderRadius: '4px', border: '1px solid #d9d9d9' }}
            placeholder="Enter value"
          />
          <button 
            onClick={handleCancelEdit}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '6px'
            }}
          >
            <CloseOutlined style={{ fontSize: '16px', color: '#1890ff' }} />
          </button>
        </div>
      ) : (
        <select 
          value={selectedOption} 
          onChange={handleSelectChange} 
          style={{
            width: '100%', 
            padding: '6px', 
            borderRadius: '4px', 
            border: '1px solid #d9d9d9', 
            backgroundColor: 'white',
            cursor: 'pointer'
          }}
        >
          <option value="">Select an option</option>
          {options.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
          <option value="Enter your own">Enter data</option>
        </select>
      )}
    </div>
  );
};

export default EditableDropdown;
