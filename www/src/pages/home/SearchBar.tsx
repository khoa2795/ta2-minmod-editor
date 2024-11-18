import { ConsoleSqlOutlined } from "@ant-design/icons";
import { Select, Space, Typography } from "antd";
import _ from "lodash";
import { useStores, Commodity, IStore } from "models";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";
import { routes } from "routes";

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

export function useSearchArgs2(): [SearchArgs, NormSearchArgs, (newArgs: SearchArgs) => void] {
  const { commodityStore } = useStores();
  const queryParams = routes.home.useQueryParams();
  const location = useLocation();

  const [args, setArgs] = useState<SearchArgs>({
    commodity: undefined,
  });

  console.log("call useSearchArgs", args);

  const updateSearchArgs = (newArgs: SearchArgs) => {
    console.log("[real update] update search args", newArgs, routes.home.getURL({ commodity: newArgs.commodity }));
    setArgs(newArgs);
    routes.home.path({ commodity: newArgs.commodity }).open();
    // window._routeAPIs.history.push("/?commodity=Lithium");
  };

  // sync with queries in the URL
  useEffect(() => {
    const inv = () => {
      const newArgs = {
        commodity: queryParams?.commodity,
      };

      if (newArgs.commodity !== undefined) {
        const commodity = commodityStore.getByName(newArgs.commodity);
        console.log("check commodity", newArgs.commodity, commodity);
        if (commodity === null) {
          // does not exist
          newArgs.commodity = undefined;
        }
      }

      console.log("[useEffect] update search args", "new=", newArgs, "old=", args, "query=", queryParams);
      console.log("location", location, "search", location.search);
      if (!_.isEqual(newArgs, args)) {
        updateSearchArgs(newArgs);
      }
    };
    // inv();
    setTimeout(inv, 1000);
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

export function useSearchArgs(): [SearchArgs, NormSearchArgs, (newArgs: SearchArgs) => void] {
  const { commodityStore } = useStores();
  const [args, setArgs] = useState<SearchArgs>({
    commodity: undefined,
  });

  const updateSearchArgs = (newArgs: SearchArgs) => {
    setArgs(newArgs);
  };

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
      <Typography.Text>Commodity:</Typography.Text>
      <Select style={{ width: 200 }} value={searchArgs.commodity} placeholder="Select a commodity" showSearch={true} optionFilterProp="label" onChange={onSelect} options={options} />
    </Space>
  );
};
