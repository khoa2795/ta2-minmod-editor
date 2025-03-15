import { Button, Checkbox, Form, Input, Modal, Select, Space } from "antd";
import { EditableSelect } from "components/EditableSelect";
import _ from "lodash";
import { MineralSite, Reference, Document, FieldEdit, EditableField, useStores } from "models";
import { useMemo } from "react";
import { EditRefDoc } from "./EditRefDoc";
import { InternalID } from "models/typing";
import { DepositTypeStore } from "models/depositType";
import { CountryStore } from "models/country";
import { StateOrProvinceStore } from "models/stateOrProvince";
import { isValidUrl } from "misc";

interface EditSiteFieldProps {
  sites: MineralSite[];
  currentSite?: MineralSite;
  commodity: InternalID;
  editField?: EditableField;
  onFinish: (change?: { edit: FieldEdit; reference: Reference }) => void;
}

type FormFields = {
  fieldValue: string | undefined;
  refDoc: Document | null;
  refComment: string;
  refAppliedToAll: boolean;
};

export const EditSiteField: React.FC<EditSiteFieldProps> = ({ currentSite, sites, editField, commodity, onFinish }) => {
  const { depositTypeStore, stateOrProvinceStore, countryStore } = useStores();
  const [form] = Form.useForm<FormFields>();

  const title = useMemo(() => {
    switch (editField) {
      case "name":
        return "Name";
      case "location":
        return "Location";
      case "country":
        return "Country";
      case "stateOrProvince":
        return "State or Province";
      case "depositType":
        return "Deposit Type";
      case "grade":
        return "Grade (0 - 100%)";
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
      form.setFieldValue("refDoc", site.getFirstReferencedDocument());
    } else {
      form.setFieldValue("refDoc", null);
    }
  };

  const docs = _.uniqBy(
    sites.flatMap((site) => Object.values(site.getReferencedDocuments())),
    "uri"
  );

  let editFieldComponent = undefined;
  let initialValues: FormFields = defaultInitialValues;
  const configArgs = { currentSite, sites, setFieldProvenance, stores: { depositTypeStore, countryStore, stateOrProvinceStore }, commodity };
  switch (editField) {
    case "name":
      [editFieldComponent, initialValues] = getNameConfig(configArgs);
      break;
    case "depositType":
      [editFieldComponent, initialValues] = getDepositTypeConfig(configArgs);
      break;
    case "location":
      [editFieldComponent, initialValues] = getLocationConfig(configArgs);
      break;
    case "country":
      [editFieldComponent, initialValues] = getCountryConfig(configArgs);
      break;
    case "stateOrProvince":
      [editFieldComponent, initialValues] = getStateOrProvinceConfig(configArgs);
      break;
    case "grade":
      [editFieldComponent, initialValues] = getGradeConfig(configArgs);
      break;
    case "tonnage":
      [editFieldComponent, initialValues] = getTonnageConfig(configArgs);
      break;
    case undefined:
      break;
    default:
      throw new Error(`Unknown field ${editField}`);
  }

  const onSave = (values: any) => {
    if (editField === undefined) return;
    const val = form.getFieldsValue();
    if (val.refDoc === null || val.fieldValue === undefined) {
      return;
    }

    let edit;
    if (editField === "name" || editField === "location") {
      edit = { field: editField, value: val.fieldValue };
    } else if (editField === "country") {
      edit = { field: editField, observedName: countryStore.getByURI(val.fieldValue)!.name, normalizedURI: val.fieldValue };
    } else if (editField === "stateOrProvince") {
      edit = { field: editField, observedName: stateOrProvinceStore.getByURI(val.fieldValue)!.name, normalizedURI: val.fieldValue };
    } else if (editField === "depositType") {
      edit = { field: editField, observedName: depositTypeStore.getByURI(val.fieldValue)!.name, normalizedURI: val.fieldValue };
    } else if (editField === "grade" || editField === "tonnage") {
      edit = { field: editField, value: parseFloat(val.fieldValue), commodity };
    } else {
      throw new Error(`Unknown field ${editField}`);
    }

    onFinish({
      edit,
      reference: new Reference({
        document: val.refDoc,
        comment: val.refComment,
        property: val.refAppliedToAll ? undefined : Reference.normalizeProperty(editField),
        pageInfo: [],
      }),
    });
  };

  return (
    <Modal
      title="Edit Mineral Site"
      width="70%"
      open={editField !== undefined}
      onCancel={() => onFinish()}
      footer={null}
    >
      <Form
        form={form}
        onFinish={onSave}
        layout="vertical"
        style={{ marginTop: 24, marginBottom: 24 }}
        requiredMark={true}
        initialValues={initialValues}
      >
        <Form.Item<FormFields>
          name="fieldValue"
          label={title}
          required={true}
          tooltip="This is a required field"
          rules={[{ required: true, message: "Value cannot be empty" }]}
        >
          {editFieldComponent}
        </Form.Item>
        <Form.Item<FormFields>
          name="refDoc"
          label="Reference"
          required={true}
          tooltip="This is a required field"
          rules={[
            {
              required: true,
              validator: (_, value: Document | null) => {
                if (value === null) {
                  return Promise.reject(new Error("Document URL is required"));
                }
                if (isValidUrl(value.uri)) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Invalid URL"));
              },
            },
          ]}
        >
          <EditRefDoc availableDocs={docs} />
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

const defaultInitialValues: FormFields = {
  fieldValue: undefined,
  refDoc: null,
  refComment: "",
  refAppliedToAll: false,
};

interface GetFieldConfig {
  currentSite: MineralSite | undefined;
  sites: MineralSite[];
  setFieldProvenance: (key: string | undefined) => void;
  stores: { depositTypeStore: DepositTypeStore; countryStore: CountryStore; stateOrProvinceStore: StateOrProvinceStore };
  commodity: InternalID;
}

const getNameConfig = ({ currentSite, sites, setFieldProvenance }: GetFieldConfig): [React.ReactElement, FormFields] => {
  const options = sites.filter((site) => site.name !== undefined).map((site) => ({ key: site.id, label: site.name! }));
  const component = <EditableSelect onProvenanceChange={setFieldProvenance} options={options} />;
  const initialValues =
    currentSite !== undefined
      ? {
          fieldValue: currentSite.name,
          refDoc: currentSite.getFirstReferencedDocument(),
          refComment: currentSite.reference[0].comment,
          refAppliedToAll: false,
        }
      : defaultInitialValues;
  return [component, initialValues];
};

const getLocationConfig = ({ currentSite, sites, setFieldProvenance }: GetFieldConfig): [React.ReactElement, FormFields] => {
  const options = sites.filter((site) => site.locationInfo?.location !== undefined).map((site) => ({ key: site.id, label: site.locationInfo!.location! }));
  const component = <EditableSelect onProvenanceChange={setFieldProvenance} options={options} />;
  const initialValues =
    currentSite !== undefined
      ? {
          fieldValue: currentSite.locationInfo?.location || "",
          refDoc: currentSite.getFirstReferencedDocument(),
          refComment: currentSite.reference[0].comment,
          refAppliedToAll: false,
        }
      : defaultInitialValues;
  return [component, initialValues];
};

const getCountryConfig = ({ currentSite, sites, setFieldProvenance, stores }: GetFieldConfig): [React.ReactElement, FormFields] => {
  let options = _.uniqBy(
    sites.flatMap((site) => site.locationInfo?.country || []).filter((country) => country.normalizedURI !== undefined),
    "normalizedURI"
  )
    .sort((a, b) => a.confidence - b.confidence)
    .map((ent) => ({ value: ent.normalizedURI!, label: stores.countryStore.getByURI(ent.normalizedURI!)!.name }));
  const predictedCountries = new Set(options.map((ent) => ent.value));
  options = options.concat(stores.countryStore.filter((ent) => !predictedCountries.has(ent.uri)).map((type) => ({ value: type.uri, label: type.name })));

  const component = <Select showSearch={true} options={options} optionFilterProp="label" />;
  const initialValues =
    currentSite !== undefined && (currentSite.locationInfo?.country || []).length > 0
      ? {
          fieldValue: currentSite.locationInfo!.country[0].normalizedURI!,
          refDoc: currentSite.getFirstReferencedDocument(),
          refComment: currentSite.reference[0].comment,
          refAppliedToAll: false,
        }
      : defaultInitialValues;
  return [component, initialValues];
};

const getStateOrProvinceConfig = ({ currentSite, sites, setFieldProvenance, stores }: GetFieldConfig): [React.ReactElement, FormFields] => {
  let options = _.uniqBy(
    sites.flatMap((site) => site.locationInfo?.stateOrProvince || []).filter((stateOrProvince) => stateOrProvince.normalizedURI !== undefined),
    "normalizedURI"
  )
    .sort((a, b) => a.confidence - b.confidence)
    .map((ent) => ({ value: ent.normalizedURI!, label: stores.stateOrProvinceStore.getByURI(ent.normalizedURI!)!.name }));
  const predictedSOP = new Set(options.map((ent) => ent.value));
  options = options.concat(stores.stateOrProvinceStore.filter((ent) => !predictedSOP.has(ent.uri)).map((type) => ({ value: type.uri, label: type.name })));

  const component = <Select showSearch={true} options={options} optionFilterProp="label" />;
  const initialValues =
    currentSite !== undefined && (currentSite.locationInfo?.stateOrProvince || []).length > 0
      ? {
          fieldValue: currentSite.locationInfo!.stateOrProvince[0].normalizedURI!,
          refDoc: currentSite.getFirstReferencedDocument(),
          refComment: currentSite.reference[0].comment,
          refAppliedToAll: false,
        }
      : defaultInitialValues;
  return [component, initialValues];
};

const getDepositTypeConfig = ({ currentSite, sites, setFieldProvenance, stores }: GetFieldConfig): [React.ReactElement, FormFields] => {
  let options = _.uniqBy(
    sites.flatMap((site) => site.depositTypeCandidate).filter((deptype) => deptype.normalizedURI !== undefined),
    "normalizedURI"
  )
    .sort((a, b) => a.confidence - b.confidence)
    .map((type) => ({ value: type.normalizedURI!, label: stores.depositTypeStore.getByURI(type.normalizedURI!)!.name }));
  const predictedDepTypes = new Set(options.map((type) => type.value));
  options = options.concat(stores.depositTypeStore.filter((type) => !predictedDepTypes.has(type.uri)).map((type) => ({ value: type.uri, label: type.name })));

  const component = <Select showSearch={true} options={options} optionFilterProp="label" />;
  const initialValues =
    currentSite !== undefined && currentSite.depositTypeCandidate.length > 0
      ? {
          fieldValue: currentSite.depositTypeCandidate[0].normalizedURI!,
          refDoc: currentSite.getFirstReferencedDocument(),
          refComment: currentSite.reference[0].comment,
          refAppliedToAll: false,
        }
      : defaultInitialValues;
  return [component, initialValues];
};

const getTonnageConfig = ({ currentSite, sites, setFieldProvenance, stores, commodity }: GetFieldConfig): [React.ReactElement, FormFields] => {
  const component = <Input type="number" />;
  const initialValues =
    currentSite !== undefined && currentSite.depositTypeCandidate.length > 0
      ? {
          fieldValue: currentSite.gradeTonnage[commodity]?.totalTonnage?.toFixed(4) || "",
          refDoc: currentSite.getFirstReferencedDocument(),
          refComment: currentSite.reference[0].comment,
          refAppliedToAll: false,
        }
      : defaultInitialValues;
  return [component, initialValues];
};

const getGradeConfig = ({ currentSite, sites, setFieldProvenance, stores, commodity }: GetFieldConfig): [React.ReactElement, FormFields] => {
  const component = <Input type="number" />;
  const initialValues =
    currentSite !== undefined && currentSite.depositTypeCandidate.length > 0
      ? {
          fieldValue: currentSite.gradeTonnage[commodity]?.totalGrade?.toFixed(4) || "",
          refDoc: currentSite.getFirstReferencedDocument(),
          refComment: currentSite.reference[0].comment,
          refAppliedToAll: false,
        }
      : defaultInitialValues;
  return [component, initialValues];
};
