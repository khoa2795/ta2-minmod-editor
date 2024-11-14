import { Button, Checkbox, Form, Input, Modal, Space } from "antd";
import { EditableSelect, EditableSelectOption } from "components/EditableSelect";
import _ from "lodash";
import { MineralSite, Reference, Document, FieldEdit, EditableField } from "models";
import { useMemo } from "react";

interface EditSiteFieldProps {
  sites: MineralSite[];
  currentSite?: MineralSite;
  commodity: string;
  editField?: EditableField;
  onFinish: (change?: { edit: FieldEdit; reference: Reference }) => void;
}

type FormFields = {
  fieldValue: string;
  refDocURI: string;
  refComment: string;
  refAppliedToAll: boolean;
};

export const EditSiteField: React.FC<EditSiteFieldProps> = ({ currentSite, sites, editField, commodity, onFinish }) => {
  const [form] = Form.useForm<FormFields>();

  const title = useMemo(() => {
    switch (editField) {
      case "name":
        return "Name";
      case "location":
        return "Location";
      case "depositType":
        return "Deposit Type";
      case "grade":
        return "Grade (%)";
      case "tonnage":
        return "Tonnage (Mt)";
      default:
        return "";
    }
  }, [editField]);

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
  let initialValues = {
    fieldValue: "",
    refDocURI: "",
    refComment: "",
    refAppliedToAll: true,
  };

  if (editField === "name") {
    fieldValueOptions = sites.map((site) => ({ key: site.id, label: site.name }));
    if (currentSite !== undefined) {
      initialValues.fieldValue = currentSite.name;
      initialValues.refDocURI = currentSite.getFirstReferencedDocument().uri;
      initialValues.refComment = currentSite.reference[0].comment;
    }
  } else if (editField === "location") {
    fieldValueOptions = sites.filter((site) => site.locationInfo.location !== undefined).map((site) => ({ key: site.id, label: site.locationInfo.location! }));
    if (currentSite !== undefined) {
      initialValues.fieldValue = currentSite.locationInfo.location || "";
      initialValues.refDocURI = currentSite.getFirstReferencedDocument().uri;
      initialValues.refComment = currentSite.reference[0].comment;
    }
  } else if (editField === "depositType") {
  }

  const docs = _.uniqBy(
    sites.flatMap((site) => Object.values(site.getReferencedDocuments()).map((doc) => ({ key: doc.uri, label: doc.title || doc.uri }))),
    "uri"
  );

  const onSave = (values: any) => {
    if (editField === undefined) return;
    const val = form.getFieldsValue();
    let edit;
    if (editField === "name" || editField === "location") {
      edit = { field: editField, value: val.fieldValue };
    } else if (editField === "depositType") {
      edit = { field: editField, observedName: val.fieldValue, normalizedURI: "" };
    } else if (editField === "grade" || editField === "tonnage") {
      edit = { field: editField, value: parseFloat(val.fieldValue), commodity };
    } else {
      throw new Error(`Unknown field ${editField}`);
    }

    onFinish({
      edit,
      reference: new Reference({
        document: new Document({ uri: val.refDocURI }),
        comment: val.refComment,
        property: val.refAppliedToAll ? undefined : Reference.normalizeProperty(editField),
      }),
    });
  };

  let fieldValueComponent;
  if (editField === "grade" || editField === "tonnage") {
    fieldValueComponent = <Input type="number" />;
  } else {
    fieldValueComponent = <EditableSelect onProvenanceChange={setFieldProvenance} options={fieldValueOptions} />;
  }

  return (
    <Modal title="Edit Mineral Site" width="70%" open={editField !== undefined} onCancel={() => onFinish()} footer={null}>
      <Form form={form} onFinish={onSave} layout="vertical" style={{ marginTop: 24, marginBottom: 24 }} requiredMark={true} initialValues={initialValues}>
        <Form.Item<FormFields> name="fieldValue" label={title} required={true} tooltip="This is a required field" rules={[{ required: true, message: "Value cannot be empty" }]}>
          {fieldValueComponent}
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
            <Button htmlType="button" onClick={() => onFinish()}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};
