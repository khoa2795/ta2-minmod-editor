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
      document: new Document(this.document.uri, this.document.title),
      comment: this.comment,
      property: this.property,
      // pageInfo: this.pageInfo
    });
  }

  public static deserialize(obj: any): Reference {
    obj = {
      ...obj,
      document: new Document(obj.document.uri, obj.document.title),
    };
    return new Reference(obj);
  }
}

export class Document {
  uri: string;
  title?: string;

  public constructor(uri: string, title?: string) {
    this.uri = uri;
    this.title = title;
  }
}

// export interface PageInfo {
//   page: number;
// }
