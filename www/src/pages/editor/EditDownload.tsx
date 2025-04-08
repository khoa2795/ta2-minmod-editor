import { DownloadOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { SERVER } from "env";
import { downloadURI } from "misc";
import { NormSearchArgs } from "./SearchBar";
import { observer } from "mobx-react-lite";

interface DownloadButtonProp {
  normSearchArgs: NormSearchArgs;
}

export const DownloadButton: React.FC<DownloadButtonProp> = observer(({ normSearchArgs }) => {
  const handleDownload = () => {
    let url: string;
    const queryParams = new URLSearchParams();
    queryParams.append("format", "csv");

    if (normSearchArgs.commodity !== undefined) queryParams.append("commodity", normSearchArgs.commodity.id);
    if (normSearchArgs.depositType !== undefined) queryParams.append("deposit_type", normSearchArgs.depositType.id);
    if (normSearchArgs.country !== undefined) queryParams.append("country", normSearchArgs.country.id);
    if (normSearchArgs.stateOrProvince !== undefined) queryParams.append("state_or_province", normSearchArgs.stateOrProvince.id);

    url = `${SERVER}/api/v1/dedup-mineral-sites?${queryParams.toString()}`;
    downloadURI(url);
  };

  return (
    <Button type="primary" icon={<DownloadOutlined />} onClick={() => handleDownload()}>
      Download
    </Button>
  );
});
