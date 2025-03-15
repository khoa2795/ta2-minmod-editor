import { Document } from "models";
import { Form, Input, Select, Typography } from "antd";
import { useState } from "react";
import { CloseCircleOutlined } from "@ant-design/icons";
export interface EditRefDocProps {
  availableDocs: Document[];
  value?: Document | null;
  onChange?: (doc: Document | null) => void;
}


const UNSELECT_VALUE = "e269e284cd592d703cb477fc2075cfde6ebfa9299e06deb0850f6061f72a6a9f";

export const EditRefDoc: React.FC<EditRefDocProps> = ({ availableDocs, value: doc, onChange }) => {
  const [selectingValue, setSelectingValue] = useState(false);
  const options: object[] = availableDocs.map((doc) => ({ value: doc.uri, label: doc.title || doc.uri }));
  options.push({ value: UNSELECT_VALUE, label: <Typography.Text italic={true}>Enter your own</Typography.Text> });

  const onUpdateOption = (uri: string) => {
    if (uri === UNSELECT_VALUE) {
      setSelectingValue(true);
      if (onChange !== undefined) onChange(null);
    } else {
      const found = availableDocs.find((doc) => doc.uri === uri);
      if (found) {
        if (onChange !== undefined) onChange(found);
      }
    }
  };

  if (selectingValue) {
    return (
        <Input
          value={doc?.uri}
          onChange={(e) => {
            const uri = e.target.value;
            if (uri !== "") {
              if (onChange !== undefined) {
                onChange(new Document({ uri, title: "" }));
              }
            } else {
              if (onChange !== undefined) {
                onChange(null);
              }
            }
          }}
          placeholder={"Enter URL of a document"}
          suffix={
            <CloseCircleOutlined
              style={{ color: "rgba(0,0,0,.25)" }}
              onClick={() => {
                setSelectingValue(false);
                if (onChange !== undefined) onChange(null);
              }}
            />
          }
        />

    );
  }
  return <Select options={options} value={doc === null || doc === undefined ? undefined : doc.uri} onChange={(uri) => onUpdateOption(uri)} />;
};
