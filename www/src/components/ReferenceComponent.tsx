import React, { useMemo } from "react";
import { Typography } from "antd";
import { MineralSite } from "models";
import { SourceStore } from "models/source";

interface ReferenceComponentProps {
    site: MineralSite;
    sourceStore: SourceStore;
}

const ReferenceComponent: React.FC<ReferenceComponentProps> = ({ site, sourceStore }) => {
    const connection = useMemo(() => {
        const sourceId = site.sourceId;
        const rawConnection = sourceStore.getByURI(sourceId);

        if (rawConnection == undefined) {
            return null;
        }

        const [type, urlTemplate] = rawConnection.split(":::");
        if ((type !== "pdf" && type !== "webpage")) {
            return null;
        }

        const recordId = site.recordId;
        const pageInfo = site.reference[0]?.pageInfo || [];
        const page = pageInfo.length > 0 && pageInfo[0]?.page ? pageInfo[0].page : 1;

        return urlTemplate.replace(/\{(\w+)(=[^}]*)?\}/g, (match, key, _defaultMatch, defaultValue) => {
            if (key === "record_id") {
                return recordId;
            } else if (key === "page_number") {
                return page !== undefined ? page.toString() : defaultValue || "1";
            } else {
                return defaultValue || "";
            }
        });
    }, [site, sourceStore]);

    const docs = useMemo(() => Object.values(site.getReferencedDocuments()), [site]);

    return connection ? (
        <Typography.Link target="_blank" href={connection}>
            {connection}
        </Typography.Link>
    ) : (
        <Typography.Text ellipsis={true} style={{ maxWidth: 200 }}>
            {docs.map((doc, index) => (
                <React.Fragment key={doc.uri}>
                    <Typography.Link target="_blank" href={doc.uri}>
                        {doc.title || doc.uri}
                    </Typography.Link>
                    {index < docs.length - 1 && <span>&nbsp;·&nbsp;</span>}
                </React.Fragment>
            ))}
        </Typography.Text>
    );
};

export default ReferenceComponent;
