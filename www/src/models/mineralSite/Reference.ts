import { isValidUrl } from "misc";

export const CDR_DOCUMENT_URL_PREFIX = "https://api.cdr.land/v1/docs/documents";

export class Reference {
  document: Document;
  comment: string;
  property?: string;
  pageInfo: PageInfo[];

  public constructor({ document, comment, property, pageInfo }: { document: Document; comment: string; property?: string; pageInfo: PageInfo[] }) {
    this.document = document;
    this.comment = comment;
    this.property = property;
    this.pageInfo = pageInfo;
  }

  public clone(): Reference {
    return new Reference({
      document: this.document.clone(),
      comment: this.comment,
      property: this.property,
      pageInfo: this.pageInfo.map(
        (info) =>
          new PageInfo({
            page: info.page,
            boundingBox: info.boundingBox
              ? new BoundingBox({
                  xMax: info.boundingBox.xMax,
                  xMin: info.boundingBox.xMin,
                  yMax: info.boundingBox.yMax,
                  yMin: info.boundingBox.yMin,
                })
              : undefined,
          })
      ),
    });
  }

  public static deserialize(obj: any): Reference {
    obj = {
      ...obj,
      document: Document.deserialize(obj.document),
      pageInfo: obj.page_info?.map((info: any) => PageInfo.deserialize(info)) || [],
    };
    return new Reference(obj);
  }

  public serialize(): object {
    return {
      document: this.document.serialize(),
      comment: this.comment,
      property: this.property,
      pageInfo: this.pageInfo.map((info) => info.serialize()),
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

  public isCDRDocument(): boolean {
    return this.uri.startsWith(CDR_DOCUMENT_URL_PREFIX);
  }

  public static cdrDocument(id: string, title: string): Document {
    return new Document({ uri: `${CDR_DOCUMENT_URL_PREFIX}/${id}`, title });
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

  public getCDRDocumentId(): string {
    if (!this.isCDRDocument()) {
      throw new Error("Not a CDR document");
    }
    return this.uri.substring(CDR_DOCUMENT_URL_PREFIX.length + 1);
  }

  public isValidCDRDocumentId(): boolean {
    return this.isCDRDocument() && this.getCDRDocumentId().length > 8 && isValidUrl(this.uri);
  }

  /** Check whether this is a valid document */
  public isValid(): boolean {
    if (this.isCDRDocument()) {
      return this.isValidCDRDocumentId();
    } else {
      return isValidUrl(this.uri);
    }
  }
}

export class PageInfo {
  page: number;
  boundingBox?: BoundingBox;

  public constructor({ page, boundingBox }: { page: number; boundingBox?: BoundingBox }) {
    this.page = page;
    this.boundingBox = boundingBox;
  }

  public static deserialize(obj: any): PageInfo {
    return new PageInfo({
      page: obj.page,
      boundingBox: obj.bounding_box ? BoundingBox.deserialize(obj.bounding_box) : undefined,
    });
  }

  public serialize(): object {
    return {
      page: this.page,
      bounding_box: this.boundingBox?.serialize(),
    };
  }
}

export class BoundingBox {
  xMax: number;
  xMin: number;
  yMax: number;
  yMin: number;

  public constructor({ xMax, xMin, yMax, yMin }: { xMax: number; xMin: number; yMax: number; yMin: number }) {
    this.xMax = xMax;
    this.xMin = xMin;
    this.yMax = yMax;
    this.yMin = yMin;
  }

  public static deserialize(obj: any): BoundingBox {
    return new BoundingBox({
      xMax: obj.x_max,
      xMin: obj.x_min,
      yMax: obj.y_max,
      yMin: obj.y_min,
    });
  }

  public serialize(): object {
    return {
      x_max: this.xMax,
      x_min: this.xMin,
      y_max: this.yMax,
      y_min: this.yMin,
    };
  }
}
