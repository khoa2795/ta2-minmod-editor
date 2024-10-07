

import React, { useEffect, useState } from 'react';
import { Input, AutoComplete } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import '../Styles/Search.css';

interface SearchBarProps {
  onSearch: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [commodities, setCommodities] = useState<string[]>([]);
  const [filteredCommodities, setFilteredCommodities] = useState<string[]>([]);

  useEffect(() => {
    const fetchCommodities = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/get_commodities');
        if (response.ok) {
          const data = await response.json();
          setCommodities(data.commodities.sort()); // Sort alphabetically
          setFilteredCommodities(data.commodities.sort()); // Initialize filtered list
        } else {
          console.error('Error fetching commodities:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching commodities:', error);
      }
    };

    fetchCommodities();
  }, []);

  const handleSearchChange = (value: string) => {
    // Filter commodities based on user input
    setFilteredCommodities(commodities.filter(commodity => commodity.toLowerCase().includes(value.toLowerCase())));
    // Call parent onSearch handler
    onSearch(value);
  };

  return (
    <div className="search-bar-container">
      <AutoComplete
        options={filteredCommodities.map(commodity => ({ value: commodity }))}
        onSelect={onSearch} // Call onSearch when an item is selected
        onSearch={handleSearchChange} // Filter suggestions as user types
        style={{ width: '100%' }}
      >
        <Input
          placeholder="Search by Commodity"
          prefix={<SearchOutlined />}
          className="search-bar"
        />
      </AutoComplete>
    </div>
  );
};

export default SearchBar;
