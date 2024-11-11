import { Dropdown, Input, MenuProps, Space } from "antd";
import { DownOutlined, SmileOutlined, UserOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useState } from "react";

export interface EditableSelectOption {
  key: string;
  label: string;
}

export interface EditableSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  onProvenanceChange: (key: string | undefined) => void;
  options: EditableSelectOption[];
}

/**
 * First time, it shows the dropdown with predefined options.
 *
 * User can select one of the predefined options, but when they click again, the dropdown
 * won't show up. User has a button to clean up the value. When they do that, the dropdown will
 * show up again.
 *
 * When user selects "Enter your own", the dropdown will disappear and an input field will show up.
 *
 * @param props
 * @returns
 */
export const EditableSelect: React.FC<EditableSelectProps> = (props) => {
  const [selectingValue, setSelectingValue] = useState(false);
  const items: MenuProps["items"] = props.options.map((option) => ({
    key: option.key,
    label: option.label,
    onClick: () => {
      setSelectingValue(true);
      if (props.onChange !== undefined) props.onChange(option.label);
      props.onProvenanceChange(option.key);
    },
  }));
  items.push({ type: "divider" });
  items.push({
    key: "new",
    label: "Enter your own",
    onClick: () => {
      setSelectingValue(true);
      props.onProvenanceChange(undefined);
      if (props.onChange !== undefined) props.onChange("");
    },
  });

  if (selectingValue) {
    return (
      <Input
        value={props.value}
        onChange={(e) => (props.onChange !== undefined ? props.onChange(e.target.value) : undefined)}
        placeholder={"Enter your own"}
        suffix={
          <CloseCircleOutlined
            style={{ color: "rgba(0,0,0,.25)" }}
            onClick={() => {
              setSelectingValue(false);
              if (props.onChange !== undefined) props.onChange("");
            }}
          />
        }
      />
    );
  }

  // Update React will solve the update state of unmounted component warnings
  // https://github.com/ant-design/ant-design/issues/44994
  return (
    <Dropdown menu={{ items, style: { marginLeft: -12, marginTop: 8 } }}>
      <Input value={props.value} placeholder={"Select an option or enter your own"} suffix={<DownOutlined style={{ color: "rgba(0,0,0,.25)" }} />} />
    </Dropdown>
  );
};
