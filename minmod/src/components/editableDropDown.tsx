import React, { useState } from 'react';

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
      setIsEditing(true); // Enable editing when an option is selected
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  const handleSave = () => {
    setSelectedOption(editValue);
    setIsEditing(false); // Exit edit mode
    onSave(editValue); // Pass the edited value to parent component
  };

  return (
    <div>
      {isEditing ? (
        <div>
          <input
            type="text"
            value={editValue}
            onChange={handleEditChange}
          />
          <button onClick={handleSave}>Save</button>
        </div>
      ) : (
        <div>
          <select value={selectedOption} onChange={handleSelectChange}>
            <option value="">Select an option</option>
            {options.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
            <option value="Enter your own">Enter data</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default EditableDropdown;
