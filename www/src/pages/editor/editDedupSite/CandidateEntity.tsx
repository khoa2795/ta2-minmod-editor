import { Typography } from "antd";
import { CandidateEntity, useStores } from "models";

type PredefinedEntityStoreName = "depositTypeStore" | "countryStore" | "stateOrProvinceStore";

interface CanEntCompProps {
  entity?: CandidateEntity;
  store?: PredefinedEntityStoreName;
}

interface ListCanEntProps {
  entities: CandidateEntity[];
  store?: PredefinedEntityStoreName;
}

export const CanEntComponent: React.FC<CanEntCompProps> = ({ entity, store }: CanEntCompProps) => {
  const stores = useStores();

  if (entity === undefined) {
    return <span>-</span>;
  }

  let name = entity.observedName === undefined ? " " : entity.observedName;
  if (entity.normalizedURI !== undefined) {
    if (store !== undefined) {
      const ent = stores[store].getByURI(entity.normalizedURI);
      if (ent !== undefined && ent !== null) {
        name = ent.name;
      }
    }
    return (
      <Typography.Link href={entity.normalizedURI} target="_blank">
        {name}
      </Typography.Link>
    );
  }

  return <span>{name}</span>;
};

export const ListCanEntComponent = ({ entities, store }: ListCanEntProps) => {
  const comp = [];

  if (entities.length > 0) {
    comp.push(<CanEntComponent key={0} entity={entities[0]} store={store} />);
  }

  for (let i = 1; i < entities.length; i++) {
    comp.push(<span>&nbsp;-&nbsp;</span>);
    comp.push(<CanEntComponent key={i} entity={entities[i]} store={store} />);
  }

  return <>{comp}</>;
};
