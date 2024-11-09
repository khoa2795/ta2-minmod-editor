export class Commodity {
  uri: string;
  name: string;

  public constructor({ uri, name }: { uri: string; name: string }) {
    this.uri = uri;
    this.name = name;
  }

  public clone(): Commodity {
    return new Commodity({
      uri: this.uri,
      name: this.name,
    });
  }

  public static deserialize(obj: any): Commodity {
    return new Commodity({
      uri: obj.uri,
      name: obj.name,
    });
  }
}
