import { Button, Checkbox, Flex, Form, Input, Modal, Select, Space } from "antd";
import { EditableSelect } from "components/EditableSelect";
import _ from "lodash";
import { MineralSite, Reference, Document, FieldEdit, EditableField, useStores } from "models";
import { useMemo, useState } from "react";
import { EditRefDoc } from "./EditRefDoc";
import { InternalID } from "models/typing";
import { DepositTypeStore } from "models/depositType";
import { CountryStore } from "models/country";
import { StateOrProvinceStore } from "models/stateOrProvince";
import { isValidUrl } from "misc";
import { FormItem } from "components/FormItem";

interface EditSiteFieldProps {
  sites: MineralSite[];
  currentSite?: MineralSite;
  commodity: InternalID;
  editField?: EditableField;
  onFinish: (change?: { edit: FieldEdit; reference: Reference }) => void;
}

type FormFields = {
  fieldValue: string | undefined;
  refDoc: Document | undefined;
  refComment: string;
};

const defaultInitialValues: FormFields = {
  fieldValue: undefined,
  refDoc: undefined,
  refComment: "",
};

export const EditSiteField: React.FC<EditSiteFieldProps> = ({ currentSite, sites, editField, commodity, onFinish }) => {
  const { depositTypeStore, stateOrProvinceStore, countryStore } = useStores();
  const [editData, setEditData] = useState<FormFields>({
    fieldValue: currentSite === undefined || editField === undefined ? undefined : currentSite.getFieldValue(editField, commodity),
    refDoc: currentSite === undefined ? undefined : currentSite.getDocument(),
    refComment: currentSite === undefined ? "" : currentSite.reference.comment,
  });

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
    if (currentSite !== undefined) {
      // if the current site is undefined, the reference is not set and can be changed
      // however, if the current site is defined, we don't modify the reference
      return;
    }

    if (key !== undefined) {
      const site = sites.filter((site) => site.id === key)[0];
      setEditData((prev) => ({ ...prev, refDoc: site.getDocument() }));
    } else {
      setEditData((prev) => ({ ...prev, refDoc: undefined }));
    }
  };

  const docs = _.uniqBy(
    sites.map((site) => site.getDocument()),
    "uri"
  );

  let editFieldComponent = undefined;
  let initialValues: FormFields = defaultInitialValues;
  const configArgs = {
    currentSite,
    sites,
    setFieldProvenance,
    stores: { depositTypeStore, countryStore, stateOrProvinceStore },
    commodity,
    value: editData.fieldValue,
    setValue: (value: string) => {
      setEditData((prev) => ({ ...prev, fieldValue: value }));
    },
  };
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

  const isDataValid = () => {
    if (editField === undefined) return false;
    const val = editData;
    if (val.refDoc === undefined || val.fieldValue === undefined || !val.refDoc.isValid()) {
      return false;
    }
    return true;
  };

  const onSave = (values: any) => {
    if (editField === undefined) return;
    const val = editData;
    if (val.refDoc === undefined || val.fieldValue === undefined || !val.refDoc.isValid()) {
      return;
    }

    let edit: FieldEdit;
    if (editField === "name" || editField === "location") {
      edit = { field: editField, value: val.fieldValue as string };
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
        pageInfo: [],
      }),
    });
  };

  return (
    <Modal title="Edit Mineral Site" width="70%" open={editField !== undefined} onCancel={() => onFinish()} footer={null}>
      <Flex gap={16} vertical={true}>
        <FormItem label={title} name="fieldValue" tooltip="This is a required field" required={true}>
          {editFieldComponent}
        </FormItem>
        <FormItem label="Reference" name="refDoc" tooltip="Source of the information (required)" required={true}>
          <EditRefDoc availableDocs={docs} value={editData.refDoc} onChange={(doc) => setEditData({ ...editData, refDoc: doc })} />
        </FormItem>
        <FormItem name="refComment" label="Comment">
          <Input.TextArea rows={3} />
        </FormItem>
        <Space>
          <Button type="primary" htmlType="submit" onClick={onSave} disabled={!isDataValid()}>
            Save
          </Button>
          <Button htmlType="button" onClick={() => onFinish()}>
            Cancel
          </Button>
        </Space>
      </Flex>
    </Modal>
  );
};

interface GetFieldConfig {
  currentSite: MineralSite | undefined;
  sites: MineralSite[];
  setFieldProvenance: (key: string | undefined) => void;
  stores: { depositTypeStore: DepositTypeStore; countryStore: CountryStore; stateOrProvinceStore: StateOrProvinceStore };
  commodity: InternalID;
  value?: string;
  setValue: (value: string) => void;
}

const getNameConfig = ({ currentSite, sites, setFieldProvenance, value, setValue }: GetFieldConfig): [React.ReactElement, FormFields] => {
  const options = sites.filter((site) => site.name !== undefined).map((site) => ({ key: site.id, label: site.name! }));
  const component = <EditableSelect onProvenanceChange={setFieldProvenance} options={options} value={value} onChange={(value) => setValue(value)} />;
  const initialValues =
    currentSite !== undefined
      ? {
          fieldValue: currentSite.name,
          refDoc: currentSite.getDocument(),
          refComment: currentSite.reference.comment,
          refAppliedToAll: false,
        }
      : defaultInitialValues;
  return [component, initialValues];
};

const getLocationConfig = ({ currentSite, sites, setFieldProvenance, value, setValue }: GetFieldConfig): [React.ReactElement, FormFields] => {
  const options = sites.filter((site) => site.locationInfo?.location !== undefined).map((site) => ({ key: site.id, label: site.locationInfo!.location! }));
  const component = <EditableSelect onProvenanceChange={setFieldProvenance} options={options} value={value} onChange={(value) => setValue(value)} />;
  const initialValues =
    currentSite !== undefined
      ? {
          fieldValue: currentSite.locationInfo?.location || "",
          refDoc: currentSite.getDocument(),
          refComment: currentSite.reference.comment,
          refAppliedToAll: false,
        }
      : defaultInitialValues;
  return [component, initialValues];
};

const getCountryConfig = ({ currentSite, sites, setFieldProvenance, stores, value, setValue }: GetFieldConfig): [React.ReactElement, FormFields] => {
  let options = _.uniqBy(
    sites.flatMap((site) => site.locationInfo?.country || []).filter((country) => country.normalizedURI !== undefined),
    "normalizedURI"
  )
    .sort((a, b) => a.confidence - b.confidence)
    .map((ent) => ({ value: ent.normalizedURI!, label: stores.countryStore.getByURI(ent.normalizedURI!)!.name }));
  const predictedCountries = new Set(options.map((ent) => ent.value));
  options = options.concat(stores.countryStore.filter((ent) => !predictedCountries.has(ent.uri)).map((type) => ({ value: type.uri, label: type.name })));

  const component = <Select showSearch={true} options={options} optionFilterProp="label" value={value} onChange={(value) => setValue(value)} />;
  const initialValues =
    currentSite !== undefined && (currentSite.locationInfo?.country || []).length > 0
      ? {
          fieldValue: currentSite.locationInfo!.country[0].normalizedURI!,
          refDoc: currentSite.getDocument(),
          refComment: currentSite.reference.comment,
          refAppliedToAll: false,
        }
      : defaultInitialValues;
  return [component, initialValues];
};

const getStateOrProvinceConfig = ({ currentSite, sites, setFieldProvenance, stores, value, setValue }: GetFieldConfig): [React.ReactElement, FormFields] => {
  let options = _.uniqBy(
    sites.flatMap((site) => site.locationInfo?.stateOrProvince || []).filter((stateOrProvince) => stateOrProvince.normalizedURI !== undefined),
    "normalizedURI"
  )
    .sort((a, b) => a.confidence - b.confidence)
    .map((ent) => ({ value: ent.normalizedURI!, label: stores.stateOrProvinceStore.getByURI(ent.normalizedURI!)!.name }));
  const predictedSOP = new Set(options.map((ent) => ent.value));
  options = options.concat(stores.stateOrProvinceStore.filter((ent) => !predictedSOP.has(ent.uri)).map((type) => ({ value: type.uri, label: type.name })));

  const component = <Select showSearch={true} options={options} optionFilterProp="label" value={value} onChange={(value) => setValue(value)} />;
  const initialValues =
    currentSite !== undefined && (currentSite.locationInfo?.stateOrProvince || []).length > 0
      ? {
          fieldValue: currentSite.locationInfo!.stateOrProvince[0].normalizedURI!,
          refDoc: currentSite.getDocument(),
          refComment: currentSite.reference.comment,
          refAppliedToAll: false,
        }
      : defaultInitialValues;
  return [component, initialValues];
};

const getDepositTypeConfig = ({ currentSite, sites, setFieldProvenance, stores, value, setValue }: GetFieldConfig): [React.ReactElement, FormFields] => {
  let options = _.uniqBy(
    sites.flatMap((site) => site.depositTypeCandidate).filter((deptype) => deptype.normalizedURI !== undefined),
    "normalizedURI"
  )
    .sort((a, b) => a.confidence - b.confidence)
    .map((type) => ({ value: type.normalizedURI!, label: stores.depositTypeStore.getByURI(type.normalizedURI!)!.name }));
  const predictedDepTypes = new Set(options.map((type) => type.value));
  options = options.concat(stores.depositTypeStore.filter((type) => !predictedDepTypes.has(type.uri)).map((type) => ({ value: type.uri, label: type.name })));

  const component = <Select showSearch={true} options={options} optionFilterProp="label" value={value} onChange={(value) => setValue(value)} />;
  const initialValues =
    currentSite !== undefined && currentSite.depositTypeCandidate.length > 0
      ? {
          fieldValue: currentSite.depositTypeCandidate[0].normalizedURI!,
          refDoc: currentSite.getDocument(),
          refComment: currentSite.reference.comment,
          refAppliedToAll: false,
        }
      : defaultInitialValues;
  return [component, initialValues];
};

const getTonnageConfig = ({ currentSite, sites, setFieldProvenance, stores, commodity, value, setValue }: GetFieldConfig): [React.ReactElement, FormFields] => {
  const component = <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} />;
  const initialValues =
    currentSite !== undefined && currentSite.depositTypeCandidate.length > 0
      ? {
          fieldValue: currentSite.gradeTonnage[commodity]?.totalTonnage?.toFixed(4) || "",
          refDoc: currentSite.getDocument(),
          refComment: currentSite.reference.comment,
          refAppliedToAll: false,
        }
      : defaultInitialValues;
  return [component, initialValues];
};

const getGradeConfig = ({ currentSite, sites, setFieldProvenance, stores, commodity, value, setValue }: GetFieldConfig): [React.ReactElement, FormFields] => {
  const component = <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} />;
  const initialValues =
    currentSite !== undefined && currentSite.depositTypeCandidate.length > 0
      ? {
          fieldValue: currentSite.gradeTonnage[commodity]?.totalGrade?.toFixed(4) || "",
          refDoc: currentSite.getDocument(),
          refComment: currentSite.reference.comment,
          refAppliedToAll: false,
        }
      : defaultInitialValues;
  return [component, initialValues];
};
