import React, { useEffect, useState } from "react";
import { Input, AutoComplete } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import "./Search.css";
import { commodityStore } from "../../stores/CommodityStore";

interface SearchBarProps {
  onSearch: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [commodities, setCommodities] = useState<string[]>([]);
  const [filteredCommodities, setFilteredCommodities] = useState<string[]>([]);

  useEffect(() => {
    const fetchCommodities = async () => {
      try {
        const commodities = (await commodityStore.fetchAll()).map((commodity) => commodity.name);
        setCommodities(commodities);
        setFilteredCommodities(commodities);
      } catch (error) {
        console.error("Error fetching commodities:", error);
      }
    };

    fetchCommodities();
  }, []);

  const handleSearchChange = (value: string) => {
    // Filter commodities based on user input
    setFilteredCommodities(commodities.filter((commodity) => commodity.toLowerCase().includes(value.toLowerCase())));
    // Call parent onSearch handler
    // TODO: fix me!!
    if (commodityStore.hasFetch() && commodityStore.getCommodityByName(value) !== undefined) {
      onSearch(value);
    }
  };

  return (
    <div className="search-bar-container">
      <AutoComplete
        options={filteredCommodities.map((commodity) => ({ value: commodity }))}
        onSelect={onSearch} // Call onSearch when an item is selected
        onSearch={handleSearchChange} // Filter suggestions as user types
        style={{ width: "100%" }}
      >
        <Input placeholder="Search by Commodity" prefix={<SearchOutlined />} className="search-bar" />
      </AutoComplete>
    </div>
  );
};

export default SearchBar;
