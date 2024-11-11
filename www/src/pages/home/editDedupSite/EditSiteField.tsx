import { Button, Checkbox, Form, Input, Modal, Space, Typography } from "antd";
import { EditableSelect, EditableSelectOption } from "components/EditableSelect";
import _ from "lodash";
import { MineralSite, Reference, Document } from "models";
import { useMemo, useState } from "react";

export type EditableField = "name" | "location" | "depositType";

interface EditSiteFieldProps {
  sites: MineralSite[];
  field?: EditableField;
  onFinish: (change?: { field: EditableField; value: string; reference: Reference }) => void;
}

type FormFields = {
  fieldValue: string;
  refDocURI: string;
  refComment: string;
  refAppliedToAll: boolean;
};

export const EditSiteField: React.FC<EditSiteFieldProps> = ({ sites, field, onFinish }) => {
  const [form] = Form.useForm<FormFields>();

  const title = useMemo(() => {
    switch (field) {
      case "name":
        return "Name";
      case "location":
        return "Location";
      case "depositType":
        return "Deposit Type";
      default:
        return "";
    }
  }, [field]);

  const setFieldProvenance = (key: string | undefined) => {
    if (key !== undefined) {
      const site = sites.filter((site) => site.id === key)[0];
      // there can be multiple docs per site, we choose the first one and
      // users can correct it.
      form.setFieldValue("refDocURI", site.getFirstReferencedDocument().uri);
    } else {
      form.setFieldValue("refDocURI", "");
    }
  };

  let fieldValueOptions: EditableSelectOption[] = [];
  if (field === "name") {
    fieldValueOptions = sites.map((site) => ({ key: site.id, label: site.name }));
  } else if (field === "location") {
    fieldValueOptions = sites.filter((site) => site.locationInfo.location !== undefined).map((site) => ({ key: site.id, label: site.locationInfo.location! }));
  } else if (field === "depositType") {
  }

  const docs = _.uniqBy(
    sites.flatMap((site) => Object.values(site.getReferencedDocuments()).map((doc) => ({ key: doc.uri, label: doc.title || doc.uri }))),
    "uri"
  );

  const onSave = (values: any) => {
    if (field === undefined) return;
    const val = form.getFieldsValue();
    onFinish({
      field,
      value: val.fieldValue,
      reference: new Reference({
        document: new Document({ uri: val.refDocURI }),
        comment: val.refComment,
        property: val.refAppliedToAll ? undefined : Reference.normalizeProperty(field),
      }),
    });
  };

  return (
    <Modal title="Edit Mineral Site" width="70%" open={field !== undefined} onCancel={() => onFinish()} footer={null}>
      <Form
        form={form}
        onFinish={onSave}
        layout="vertical"
        style={{ marginTop: 24, marginBottom: 24 }}
        requiredMark={true}
        initialValues={{
          fieldValue: "",
          refDocURI: "",
          refComment: "",
          refAppliedToAll: true,
        }}
      >
        <Form.Item<FormFields> name="fieldValue" label={title} required={true} tooltip="This is a required field" rules={[{ required: true, message: "Value cannot be empty" }]}>
          <EditableSelect onProvenanceChange={setFieldProvenance} options={fieldValueOptions} />
        </Form.Item>
        <Form.Item<FormFields> name="refDocURI" label="Reference" required={true} tooltip="This is a required field" rules={[{ required: true, type: "url", message: "Document URL" }]}>
          <EditableSelect onProvenanceChange={() => {}} options={docs} />
        </Form.Item>
        <Form.Item<FormFields> name="refComment" label="Comment">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item<FormFields> name="refAppliedToAll" valuePropName="checked">
          <Checkbox>This reference applies to all fields</Checkbox>
        </Form.Item>
        <Form.Item<FormFields>>
          <Space>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
            <Button htmlType="button">Cancel</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};
