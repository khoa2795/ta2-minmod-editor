import { DownloadOutlined } from "@ant-design/icons";
import { Button, Space } from "antd";
import { SERVER } from "env";
import { downloadURI } from "misc";

export const DownloadButton: React.FC = () => {
  const handleDownload = () => {
    const url = `${SERVER}/api/v1/dedup-mineral-sites?format=csv`;
    downloadURI(url);
  };

  return (
    <Space>
      <Button type="primary" icon={<DownloadOutlined />} onClick={() => handleDownload()}>
        Download
      </Button>
    </Space>
  );
};
