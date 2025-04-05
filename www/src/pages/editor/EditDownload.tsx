import { DownloadOutlined } from "@ant-design/icons";
import { Button, Space } from "antd";
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
    if (normSearchArgs.commodity) queryParams.append("commodity", normSearchArgs.commodity.id);
    if (normSearchArgs.depositType) queryParams.append("depositType", normSearchArgs.depositType.id);
    if (normSearchArgs.country) queryParams.append("country", normSearchArgs.country.id);
    if (normSearchArgs.stateOrProvince) queryParams.append("stateOrProvince", normSearchArgs.stateOrProvince.id);

    url = `${SERVER}/api/v1/dedup-mineral-sites?${queryParams.toString()}`;
    downloadURI(url);
  };

  return (
    <Button type="primary" icon={<DownloadOutlined />} onClick={() => handleDownload()}>
      Download
    </Button>
  );
});
