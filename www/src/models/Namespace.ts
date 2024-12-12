import { InternalID, IRI } from "./typing";

export class BindedNamespace {
  prefix: string;
  namespace: string;

  constructor(prefix: string, namespace: string) {
    this.prefix = prefix;
    this.namespace = namespace;
  }

  getURI(id: InternalID): IRI {
    return `${this.namespace}${id}`;
  }
}

export class NamespaceManager {
  MR: BindedNamespace = new BindedNamespace("mr", "https://minmod.isi.edu/resource/");
  MO: BindedNamespace = new BindedNamespace("mo", "https://minmod.isi.edu/ontology/");
  MD: BindedNamespace = new BindedNamespace("md", "https://minmod.isi.edu/derived/");
}
