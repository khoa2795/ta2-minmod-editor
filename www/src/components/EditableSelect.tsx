import { Input, Select, Typography } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
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

const UNSELECT_VALUE = "e269e284cd592d703cb477fc2075cfde6ebfa9299e06deb0850f6061f72a6a9f";

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
  const [selectingValue, setSelectingValue] = useState(props.value !== undefined);
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

  const options: object[] = props.options.map((option) => ({ value: option.key, label: option.label }));
  options.push({ value: UNSELECT_VALUE, label: <Typography.Text italic={true}>Enter your own</Typography.Text> });

  const onUpdateOption = (option: { value: string; label: string }) => {
    setSelectingValue(true);
    if (props.onChange !== undefined) props.onChange(option.value === UNSELECT_VALUE ? "" : option.label);
    if (option.value !== UNSELECT_VALUE) props.onProvenanceChange(option.value);
  };

  return <Select options={options} onChange={(value, option) => onUpdateOption(option as any)} />;
};
