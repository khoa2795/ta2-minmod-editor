import { Document, User, useStores } from "models";
import { Flex, Form, Input, Radio, Select, Space, Typography } from "antd";
import { FormLabel } from "components/FormLabel";
import { observer } from "mobx-react-lite";
import { isValidUrl } from "misc";

export interface EditRefDocProps {
  availableDocs: Document[];
  value?: Document;
  onChange?: (doc: Document) => void;
}

const UNSELECT_VALUE = "e269e284cd592d703cb477fc2075cfde6ebfa9299e06deb0850f6061f72a6a9f";

export const EditRefDoc: React.FC<EditRefDocProps> = observer(({ availableDocs, value: doc, onChange: onChangeArg }) => {
  const { userStore } = useStores();

  const options: object[] = availableDocs.map((doc) => ({ value: doc.uri, label: doc.title || doc.uri }));
  options.push({ value: UNSELECT_VALUE, label: <Typography.Text italic={true}>Enter your own</Typography.Text> });

  const onChange = onChangeArg === undefined ? (doc: Document) => {} : onChangeArg;

  const onUpdateOption = (uri: string) => {
    if (uri === UNSELECT_VALUE) {
      onChange(new Document({ uri: "", title: "" }));
    } else {
      const found = availableDocs.find((doc) => doc.uri === uri);
      if (found) {
        onChange(found);
      }
    }
  };

  const isEnteringYourOwn = doc !== undefined && availableDocs.every((availableDoc) => availableDoc.uri !== doc.uri);
  const selectOption = <Select style={{ width: "100%" }} options={options} value={isEnteringYourOwn ? UNSELECT_VALUE : doc?.uri} onChange={(uri) => onUpdateOption(uri)} />;

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      {selectOption}
      {doc !== undefined && <EditSource document={doc} currentUser={userStore.getCurrentUser()!} updateDocument={onChange} disabled={!isEnteringYourOwn} />}
    </Space>
  );
});

export const EditSource: React.FC<{ document: Document; currentUser: User; updateDocument: (doc: Document) => void; disabled: boolean }> = ({
  document: doc,
  currentUser,
  updateDocument,
  disabled,
}) => {
  let docType;
  let errorMessage = undefined;
  if (doc.uri === currentUser.url) {
    docType = "unpublished";
  } else if (doc.isCDRDocument()) {
    docType = "report";
    if (!doc.isValidCDRDocumentId()) {
      errorMessage = "Invalid CDR document ID";
    }
  } else {
    docType = "article";
    if (!doc.isValid()) {
      errorMessage = "Invalid Document URL";
    }
  }

  const updateDocType = (e: any) => {
    const value = e.target.value;
    if (value === "report") {
      updateDocument(Document.cdrDocument("", ""));
    } else if (value === "article") {
      updateDocument(new Document({ uri: "", title: "" }));
    } else {
      updateDocument(new Document({ uri: currentUser.url, title: `Unpublished document by ${currentUser.name}` }));
    }
  };

  const updateDocTitle = (e: any) => {
    const value = e.target.value;
    updateDocument(new Document({ uri: doc.uri, title: value }));
  };

  const updateDocURI = (e: any) => {
    const value = e.target.value;
    updateDocument(new Document({ uri: value, title: doc.title }));
  };

  let content = undefined;
  if (docType === "report") {
    content = (
      <>
        <div style={{ width: "100%" }}>
          <FormLabel label="Title" />
          <Input placeholder={"Document Title"} value={doc.title} onChange={updateDocTitle} disabled={disabled} />
        </div>
        <div style={{ width: "100%" }}>
          <FormLabel label="Document ID" required={true} tooltip="CDR ID of document e.g., 02a000a83e76360bec8f3fce2ff46cc8099f950cc1f757f8a16592062c49b3a5c5" />
          <Input placeholder={"Document ID"} value={doc.getCDRDocumentId()} onChange={updateDocURI} disabled={disabled} />
          {errorMessage !== undefined && <Typography.Text type="danger">{errorMessage}</Typography.Text>}
        </div>
      </>
    );
  } else if (docType === "article") {
    content = (
      <>
        <div style={{ width: "100%" }}>
          <FormLabel label="Title" />
          <Input placeholder={"Document Title"} value={doc.title} onChange={updateDocTitle} disabled={disabled} />
        </div>
        <div style={{ width: "100%" }}>
          <FormLabel label="Document URL" required={true} tooltip="If the document has a DOI, please enter the DOI URL such as https://doi.org/10.1016/j.oregeorev.2016.08.010" />
          <Input placeholder={"Document URL"} value={doc.uri} onChange={updateDocURI} disabled={disabled} />
          {errorMessage !== undefined && <Typography.Text type="danger">{errorMessage}</Typography.Text>}
        </div>
      </>
    );
  } else {
    content = (
      <div style={{ width: "100%" }}>
        <FormLabel label="Title" />
        <Input placeholder={"Document Title"} value={doc.title} onChange={updateDocTitle} disabled={disabled} />
      </div>
    );
  }

  return (
    <Flex gap="middle" align="start" vertical={true} style={{ border: "1px dashed #ddd", borderRadius: 4, padding: 8 }}>
      <Radio.Group value={docType} onChange={updateDocType} disabled={disabled}>
        <Radio value="report">CDR Document</Radio>
        <Radio value="article">Article</Radio>
        <Radio value="unpublished">Unpublished</Radio>
      </Radio.Group>
      {content}
    </Flex>
  );
};
