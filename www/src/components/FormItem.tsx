import { Flex, Space } from "antd";
import { ReactElement } from "react";
import { FormLabel } from "./FormLabel";

export const FormItem = ({ label, name, required, children, tooltip, inline }: { label: string; name: string; tooltip?: string; required?: boolean; children?: ReactElement; inline?: boolean }) => {
  if (inline === true) {
    return (
      <Space size={"small"}>
        <FormLabel label={label} name={name} required={required} tooltip={tooltip} />
        {children}
      </Space>
    );
  }
  return (
    <Flex vertical={true} gap={4}>
      <FormLabel label={label} name={name} required={required} tooltip={tooltip} style={{ display: "block" }} />
      {children}
    </Flex>
  );
};
