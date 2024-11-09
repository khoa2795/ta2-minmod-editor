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
