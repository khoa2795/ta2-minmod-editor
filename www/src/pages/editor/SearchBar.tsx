import { Select, Space, Typography } from "antd";
import _ from "lodash";
import { useStores, Commodity, IStore, Country, StateOrProvince } from "models";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { routes } from "routes";
import { useQueryParams } from "gena-app";
import { observer } from "mobx-react-lite";

interface SearchBarProps {
  searchArgs: SearchArgs;
  setSearchArgs: (args: SearchArgs) => void;
}

interface SearchArgs {
  commodity?: string;
  country?: string;
  stateOrProvince?: string;
}

interface NormSearchArgs {
  commodity?: Commodity;
  country?: Country;
  stateOrProvince?: StateOrProvince;
}

export function useSearchArgs(): [SearchArgs, NormSearchArgs, (newArgs: SearchArgs) => void] {
  const { commodityStore, countryStore, stateOrProvinceStore } = useStores();
  const navigate = useNavigate();
  const queryParams = useQueryParams(routes.editor);

  const [args, setArgs] = useState<SearchArgs>({
    commodity: undefined,
    country: undefined,
    stateOrProvince: undefined,
  });

  const updateSearchArgs = (newArgs: SearchArgs) => {
    setArgs(newArgs);
    routes.editor.path({ queryArgs: { commodity: newArgs.commodity, stateOrProvince: newArgs.stateOrProvince, country: newArgs.country } }).open(navigate);
  };

  // sync with queries in the URL
  useEffect(() => {
    const newArgs = {
      commodity: queryParams?.commodity,
      country: queryParams?.country,
      stateOrProvince: queryParams?.stateOrProvince,
    };

    if (newArgs.commodity !== undefined) {
      const commodity = commodityStore.getByName(newArgs.commodity);
      if (commodity === null) {
        // does not exist
        newArgs.commodity = undefined;
      }
    }

    if (newArgs.country !== undefined) {
      const country = countryStore.getByName(newArgs.country);
      if (country === null) {
        // does not exist
        newArgs.country = undefined;
      }
    }

    if (newArgs.stateOrProvince !== undefined) {
      const stateOrProvince = stateOrProvinceStore.getByName(newArgs.stateOrProvince);
      if (stateOrProvince === null) {
        // does not exist
        newArgs.stateOrProvince = undefined;
      }
    }
    if (!_.isEqual(newArgs, args)) {
      updateSearchArgs(newArgs);
    }
  }, [commodityStore.records.size, queryParams?.commodity, queryParams?.country, queryParams?.stateOrProvince]);

  const normArgs: NormSearchArgs = useMemo(() => {
    const output: NormSearchArgs = {
      commodity: undefined,
      country: undefined,
      stateOrProvince: undefined,
    };

    // commodity is a required field
    if (args.commodity === undefined) {
      return output;
    }
    const commodity = commodityStore.getByName(args.commodity);
    if (commodity !== null && commodity !== undefined) {
      output.commodity = commodity;
    }

    if (args.country !== undefined) {
      const country = countryStore.getByName(args.country);
      if (country !== null && country !== undefined) {
        output.country = country;
      }
    }

    if (args.stateOrProvince !== undefined) {
      const stateOrProvince = stateOrProvinceStore.getByName(args.stateOrProvince);
      if (stateOrProvince !== null && stateOrProvince !== undefined) {
        output.stateOrProvince = stateOrProvince;
      }
    }

    return output;
  }, [commodityStore.records.size, countryStore.records.size, stateOrProvinceStore.records.size, args.commodity]);

  return [args, normArgs, updateSearchArgs];
}

export const SearchBar: React.FC<SearchBarProps> = observer(({ searchArgs, setSearchArgs }) => {
  const { commodityStore, countryStore, stateOrProvinceStore } = useStores();

  const commodityOptions = useMemo(() => {
    return commodityStore.getCriticalCommodities().map((comm) => {
      return {
        value: comm.id,
        label: comm.name,
      };
    });
  }, [commodityStore.records.size]);

  const countryOptions = useMemo(() => {
    return countryStore.list.map((ent) => {
      return {
        value: ent.id,
        label: ent.name,
      };
    });
  }, [countryStore.records.size]);

  const stateOrProvinceOptions = useMemo(() => {
    return stateOrProvinceStore.list.map((ent) => {
      return {
        value: ent.id,
        label: ent.name,
      };
    });
  }, [stateOrProvinceStore.records.size]);

  return (
    <Space>
      <Typography.Text>
        Commodity<span style={{ color: "red" }}>*</span>:
      </Typography.Text>
      <Select
        style={{ width: 200 }}
        value={searchArgs.commodity}
        placeholder="Select a commodity"
        showSearch={true}
        optionFilterProp="label"
        onChange={(id: string) => setSearchArgs({ ...searchArgs, commodity: commodityStore.get(id)!.name })}
        options={commodityOptions}
      />
      <Typography.Text>Country:</Typography.Text>
      <Select
        style={{ width: 150 }}
        allowClear={true}
        disabled={searchArgs.commodity === undefined}
        value={searchArgs.country}
        placeholder="Select a country"
        showSearch={true}
        optionFilterProp="label"
        onChange={(id?: string) => setSearchArgs({ ...searchArgs, country: id === undefined ? undefined : countryStore.get(id)!.name })}
        options={countryOptions}
      />
      <Typography.Text>State/Province:</Typography.Text>
      <Select
        style={{ width: 150 }}
        allowClear={true}
        disabled={searchArgs.commodity === undefined}
        value={searchArgs.stateOrProvince}
        placeholder="Select a state/province"
        showSearch={true}
        optionFilterProp="label"
        onChange={(id?: string) => setSearchArgs({ ...searchArgs, stateOrProvince: id === undefined ? undefined : stateOrProvinceStore.get(id)!.name })}
        options={stateOrProvinceOptions}
      />
    </Space>
  );
});
