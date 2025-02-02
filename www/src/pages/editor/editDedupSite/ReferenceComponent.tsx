import React, { useMemo } from "react";
import { Space, Typography } from "antd";
import { MineralSite, useStores, Document } from "models";
import { observer } from "mobx-react-lite";
import { ExportOutlined } from "@ant-design/icons";

interface ReferenceComponentProps {
  site: MineralSite;
}

function getRecordURL(site: MineralSite, richUrlTemplate: string): string | undefined {
  const [urlType, urlTemplate] = richUrlTemplate.split(":::", 2);
  if (urlType !== "pdf" && urlType !== "webpage") {
    return undefined;
  }

  const pageInfo = site.reference[0]?.pageInfo || [];
  const page = pageInfo[0]?.page;

  return urlTemplate.replace(/\{(\w+)(=[^}]*)?\}/g, (match, key, _defaultMatch, defaultValue) => {
    if (key === "record_id") {
      return site.recordId;
    } else if (key === "page_number") {
      return page !== undefined ? page.toString() : defaultValue || "1";
    } else {
      return defaultValue || "";
    }
  });
}

export const ReferenceComponent: React.FC<ReferenceComponentProps> = observer(({ site }) => {
  const { sourceStore } = useStores();
  const connection = useMemo(() => {
    const rawConnection = sourceStore.get(site.sourceId)?.connection;
    if (rawConnection == undefined) {
      return undefined;
    }
    return getRecordURL(site, rawConnection);
  }, [site, sourceStore.records.size]);

  const docs = useMemo(() => Object.values(site.getReferencedDocuments()), [site]);
  let content;

  if (connection !== undefined) {
    // TODO: fix me, we can solve this bug merging source & docs
    const doc = docs[0];
    content = (
      <Typography.Link target="_blank" href={connection} title={doc.title || doc.uri} className="font-small">
        {getDocTitle(doc)}
      </Typography.Link>
    );
  } else {
    content = docs.map((doc, index) => (
      <React.Fragment key={doc.uri}>
        <Typography.Link target="_blank" href={doc.uri} title={doc.title || doc.uri} className="font-small">
          {getDocTitle(doc)}
        </Typography.Link>
        {index < docs.length - 1 && <span>&nbsp;·&nbsp;</span>}
      </React.Fragment>
    ));
  }

  return <Typography.Text>{content}</Typography.Text>;
});

const getDocTitle = (doc: Document) => {
  if (doc.title !== undefined) {
    return doc.title;
  }
  if (doc.uri.length > 70) {
    return doc.uri.substring(0, 70) + "...";
  }
  return doc.uri;
};
