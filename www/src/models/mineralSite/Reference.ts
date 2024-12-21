export class Reference {
  document: Document;
  comment: string;
  property?: string;
  // pageInfo: PageInfo[];

  public constructor({
    document,
    comment,
    property,
  }: {
    document: Document;
    comment: string;
    property?: string;
    // pageInfo: PageInfo[]
  }) {
    this.document = document;
    this.comment = comment;
    this.property = property;
    // this.pageInfo = pageInfo;
  }

  public clone(): Reference {
    return new Reference({
      document: this.document.clone(),
      comment: this.comment,
      property: this.property,
      // pageInfo: this.pageInfo
    });
  }

  public static deserialize(obj: any): Reference {
    obj = {
      ...obj,
      document: Document.deserialize(obj.document),
    };
    return new Reference(obj);
  }

  public serialize(): object {
    return {
      document: this.document.serialize(),
      comment: this.comment,
      property: this.property,
      // pageInfo: this.pageInfo
    };
  }

  public static normalizeProperty(property: "name" | "location" | "country" | "stateOrProvince" | "depositType" | "grade" | "tonnage"): string {
    switch (property) {
      case "name":
        return "http://www.w3.org/2000/01/rdf-schema#label";
      case "location":
        return "https://minmod.isi.edu/ontology/location";
      case "country":
        return "https://minmod.isi.edu/ontology/country";
      case "stateOrProvince":
        return "https://minmod.isi.edu/ontology/state_or_province";
      case "depositType":
        return "https://minmod.isi.edu/ontology/deposit_type";
      case "grade":
        return "https://minmod.isi.edu/ontology/grade";
      case "tonnage":
        return "https://minmod.isi.edu/ontology/ore";
      default:
        return "";
    }
  }
}

export class Document {
  uri: string;
  title?: string;

  public constructor({ uri, title }: { uri: string; title?: string }) {
    this.uri = uri;
    this.title = title;
  }

  public clone(): Document {
    return new Document({ uri: this.uri, title: this.title });
  }
  public static deserialize(obj: any): Document {
    return new Document({
      uri: obj.uri,
      title: obj.title,
    });
  }
  public serialize(): object {
    return {
      uri: this.uri,
      title: this.title,
    };
  }
}

// export interface PageInfo {
//   page: number;
// }
