import { DownloadOutlined } from "@ant-design/icons";
import { Button, message, Modal, Space } from "antd";
import { useState } from "react";
import axios from "axios";
import { SERVER } from "env";

export const DownloadButton: React.FC = () => {
  const [isOpen, setOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const handleDownload = async (format: "json" | "csv") => {
    messageApi.open({
      type: "info",
      content: "Your download is in progress.",
    });
    try {
      await axios
        .get(`${SERVER}/api/v1/dedup-mineral-sites?format=${format}`, {
          responseType: "blob",
        })
        .then((response) => {
          setOpen(false);
          const disposition = response.headers["content-disposition"];
          const blob = new Blob([response.data], { type: response.headers["content-type"] });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", disposition);
          document.body.appendChild(link);
          link.click();
          link.remove();
          messageApi.open({
            type: "success",
            content: "Download success",
          });
        });
    } catch (error) {
      setOpen(false);
      console.log("Download error");
      messageApi.open({
        type: "error",
        content: "Download error",
      });
    }
  };
  return (
    <>
      {contextHolder}
      <Space>
        <Button type="primary" icon={<DownloadOutlined />} onClick={() => setOpen(true)}></Button>
        <Modal title="Type of file" open={isOpen} onCancel={() => setOpen(false)} footer={null} width="70%">
          <Space direction="vertical" size="large">
            <Button type="primary" icon={<DownloadOutlined />} onClick={() => handleDownload("json")}>
              Json
            </Button>
            <Button type="primary" icon={<DownloadOutlined />} onClick={() => handleDownload("csv")}>
              Csv
            </Button>
          </Space>
        </Modal>
      </Space>
    </>
  );
};
