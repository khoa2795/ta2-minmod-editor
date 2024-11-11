import { Button, Col, Flex, Row, Select, Space, Table, Typography } from "antd";
import { toJS } from "mobx";
import { observer } from "mobx-react";
import { useStores, Commodity, DedupMineralSite, MineralSite, CandidateEntity, Reference } from "models";
import { useEffect, useMemo, useState } from "react";
import { WithStyles, withStyles } from "@material-ui/styles";
import { CanEntComponent, ListCanEntComponent } from "./CandidateEntity";
import { join } from "misc";
import { EditOutlined } from "@ant-design/icons";
import { EditableField, EditSiteField } from "./EditSiteField";

const css = {
  table: {
    "& .ant-table": {
      margin: "0px !important",
      border: "1px solid #ccc",
    },
  },
  editButton: {
    cursor: "pointer",
  },
};

interface EditDedupMineralSiteProps {
  commodity: Commodity;
  dedupSite: DedupMineralSite;
}

export const EditDedupMineralSite = withStyles(css)(
  observer(({ dedupSite, commodity, classes }: EditDedupMineralSiteProps & WithStyles<typeof css>) => {
    const { mineralSiteStore } = useStores();
    const [editField, setEditField] = useState<EditableField | undefined>(undefined);

    const columns = useMemo(() => {
      return [
        {
          title: (
            <Flex justify="space-between">
              <span>Name</span>
              <EditOutlined className={classes.editButton} onClick={() => setEditField("name")} />
            </Flex>
          ),
          key: "name",
          render: (_: any, site: MineralSite) => {
            return (
              <Typography.Link href={site.uri} target="_blank">
                {site.name}
              </Typography.Link>
            );
          },
        },
        {
          title: (
            <Flex justify="space-between">
              <span>Location</span>
              <EditOutlined className={classes.editButton} onClick={() => setEditField("location")} />
            </Flex>
          ),
          key: "location",
          render: (_: any, site: MineralSite) => {
            return (
              <Typography.Text className="font-small" ellipsis={true} style={{ maxWidth: 200 }}>
                {site.locationInfo.location}
              </Typography.Text>
            );
          },
        },
        {
          title: "CRS",
          key: "crs",
          render: (_: any, site: MineralSite) => {
            return <span>{site.locationInfo.crs?.observedName}</span>;
          },
        },
        {
          title: "Country",
          key: "country",
          render: (_: any, site: MineralSite) => {
            return <ListCanEntComponent entities={site.locationInfo.country} />;
          },
        },
        {
          title: "State/Province",
          key: "state/province",
          render: (_: any, site: MineralSite) => {
            return <ListCanEntComponent entities={site.locationInfo.stateOrProvince} />;
          },
        },
        {
          title: (
            <Flex justify="space-between">
              <span>Dep. Type</span>
              <EditOutlined className={classes.editButton} onClick={() => setEditField("depositType")} />
            </Flex>
          ),
          key: "deposit-type",
          render: (_: any, site: MineralSite) => {
            return <CanEntComponent entity={site.depositTypeCandidate[0]} />;
          },
        },
        {
          title: "Dep. Confidence",
          key: "dep-type-confidence",
          render: (_: any, site: MineralSite) => {
            if (site.depositTypeCandidate.length === 0) {
              return "-";
            }
            return site.depositTypeCandidate[0].confidence.toFixed(4);
          },
        },
        {
          title: "Tonnage (Mt)",
          key: "tonnage",
          render: (_: any, site: MineralSite) => {
            const gradeTonnage = site.gradeTonnage[commodity.uri];
            if (gradeTonnage === undefined || gradeTonnage.totalTonnage === undefined) {
              return "-";
            }
            return gradeTonnage.totalTonnage.toFixed(2);
          },
        },
        {
          title: "Grade (%)",
          key: "grade",
          render: (_: any, site: MineralSite) => {
            const gradeTonnage = site.gradeTonnage[commodity.uri];
            if (gradeTonnage === undefined || gradeTonnage.totalGrade === undefined) {
              return "-";
            }
            return gradeTonnage.totalGrade.toFixed(2);
          },
        },
        {
          title: "Reference",
          key: "reference",
          render: (_: any, site: MineralSite) => {
            return <ReferenceComponent site={site} />;
          },
        },
      ];
    }, [commodity.id]);

    useEffect(() => {
      mineralSiteStore.fetchByIds(dedupSite.sites.map((site) => site.uri));
    }, [mineralSiteStore]);

    const fetchedSites = dedupSite.sites.map((site) => mineralSiteStore.get(site.uri)).filter((site) => site !== undefined);
    const sites = fetchedSites.filter((site) => site !== null);
    const isLoading = mineralSiteStore.state.value === "updating" || fetchedSites.length !== dedupSite.sites.length;

    const onEditFinish = (change?: { field: EditableField; value: string; reference: Reference }) => {
      console.log("onEditFinish", change);
      setEditField(undefined);
    };

    return (
      <>
        <Table<MineralSite> className={classes.table} bordered={true} pagination={false} size="small" rowKey="id" columns={columns} dataSource={sites} loading={isLoading} />
        <EditSiteField key={editField} sites={sites} field={editField} onFinish={onEditFinish} />
      </>
    );
  })
) as React.FC<EditDedupMineralSiteProps>;

const ReferenceComponent: React.FC<{ site: MineralSite }> = ({ site }) => {
  const docs = useMemo(() => {
    return Object.values(site.getReferencedDocuments());
  }, [site]);

  return (
    <Typography.Text ellipsis={true} style={{ maxWidth: 200 }}>
      {join(
        docs.map((doc) => (
          <Typography.Link key={doc.uri} target="_blank" href={doc.uri}>
            {doc.title || doc.uri}
          </Typography.Link>
        )),
        (index) => (
          <span key={`sep-${index}`}>&nbsp;·&nbsp;</span>
        )
      )}
    </Typography.Text>
  );
};
