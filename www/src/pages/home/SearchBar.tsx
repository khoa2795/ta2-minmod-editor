import { Select, Space, Typography } from "antd";
import { useStores, Commodity } from "models";
import { useEffect, useState } from "react";

interface SearchBarProps {
  onSearch: (args: { commodity: Commodity }) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const { commodityStore } = useStores();
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    commodityStore.fetchCriticalCommotities().then((commodities) => {
      setOptions(
        commodities.map((comm) => ({
          value: comm.id,
          label: comm.name,
        }))
      );
    });
  }, [commodityStore]);

  const onSelect = (value: string) => {
    onSearch({ commodity: commodityStore.get(value)! });
  };

  return (
    <Space>
      <Typography.Text>Commodity:</Typography.Text>
      <Select style={{ width: 200 }} placeholder="Select a commodity" showSearch={true} optionFilterProp="label" onChange={onSelect} options={options} />
    </Space>
  );
};
