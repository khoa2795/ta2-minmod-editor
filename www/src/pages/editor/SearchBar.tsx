import { Select, Space, Typography } from "antd";
import _ from "lodash";
import { useStores, Commodity, IStore } from "models";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { routes } from "routes";
import { useQueryParams } from "gena-app";
import { InternalID } from "models/typing";

interface SearchBarProps {
  searchArgs: SearchArgs;
  setSearchArgs: (args: SearchArgs) => void;
}

interface SearchArgs {
  commodity?: string;
}

interface NormSearchArgs {
  commodity?: Commodity;
}

export function useSearchArgs(): [SearchArgs, NormSearchArgs, (newArgs: SearchArgs) => void] {
  const { commodityStore } = useStores();
  const navigate = useNavigate();
  const queryParams = useQueryParams(routes.editor);

  const [args, setArgs] = useState<SearchArgs>({
    commodity: undefined,
  });

  const updateSearchArgs = (newArgs: SearchArgs) => {
    setArgs(newArgs);
    routes.editor.path({ queryArgs: { commodity: newArgs.commodity } }).open(navigate);
  };

  // sync with queries in the URL
  useEffect(() => {
    const newArgs = {
      commodity: queryParams?.commodity,
    };

    if (newArgs.commodity !== undefined) {
      const commodity = commodityStore.getByName(newArgs.commodity);
      if (commodity === null) {
        // does not exist
        newArgs.commodity = undefined;
      }
    }

    if (!_.isEqual(newArgs, args)) {
      updateSearchArgs(newArgs);
    }
  }, [commodityStore.records.size, queryParams?.commodity]);

  const normArgs: NormSearchArgs = useMemo(() => {
    if (args.commodity === undefined) {
      return {
        commodity: undefined,
      };
    }
    const commodity = commodityStore.getByName(args.commodity);
    return {
      commodity: commodity === null ? undefined : commodity,
    };
  }, [commodityStore.records.size, args.commodity]);

  return [args, normArgs, updateSearchArgs];
}

export const SearchBar: React.FC<SearchBarProps> = ({ searchArgs, setSearchArgs }) => {
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
    setSearchArgs({ commodity: commodityStore.get(value)!.name });
  };

  return (
    <Space>
      <Typography.Text>
        Commodity<span style={{ color: "red" }}>*</span>:
      </Typography.Text>
      <Select style={{ width: 200 }} value={searchArgs.commodity} placeholder="Select a commodity" showSearch={true} optionFilterProp="label" onChange={onSelect} options={options} />
    </Space>
  );
};
