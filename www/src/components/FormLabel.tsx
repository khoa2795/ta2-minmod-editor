import { Space, Tooltip, Typography } from "antd";
import styles from "./FormLabel.module.css";
import { QuestionCircleOutlined } from "@ant-design/icons";
import React from "react";

export const FormLabel = ({ label, name, required = false, tooltip, style }: { label: string; tooltip?: string; required?: boolean; name?: string; style?: React.CSSProperties }) => {
  const className = required ? styles.requiredLabel : "";

  return (
    <label htmlFor={name} className={className} style={style}>
      <Space size={4}>
        {label}
        {tooltip !== undefined && (
          <Tooltip title={tooltip}>
            <Typography.Text type="secondary" style={{ cursor: "help" }}>
              <QuestionCircleOutlined />
            </Typography.Text>
          </Tooltip>
        )}
      </Space>
    </label>
  );
};
