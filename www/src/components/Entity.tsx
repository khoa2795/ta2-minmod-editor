import { Typography } from "antd";
import { useStores } from "models";

export interface EntityProps {
  uri: string;
  store: "countryStore" | "commodityStore" | "depositTypeStore" | "stateOrProvinceStore";
}

export const Entity: React.FC<EntityProps> = ({ uri, store }) => {
  const db = useStores()[store];
  const record = db.get(uri);

  if (record === null) {
    return (
      <Typography.Link href={uri} target="_blank">
        Not found
      </Typography.Link>
    );
  }

  if (record === undefined) {
    return (
      <Typography.Link href={uri} target="_blank">
        Loading...
      </Typography.Link>
    );
  }

  return (
    <Typography.Link href={uri} target="_blank">
      {record.name}
    </Typography.Link>
  );
};
