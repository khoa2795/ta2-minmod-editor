export interface Reference {
  document: Document;
  comment: string;
  property?: string;
  pageInfo: PageInfo[];
}

export interface Document {
  uri: string;
  title?: string;
}

export interface PageInfo {
  page: number;
}
