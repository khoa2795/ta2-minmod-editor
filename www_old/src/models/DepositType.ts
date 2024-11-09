export class DepositType {
  name: string;
  group: string;
  environment: string;
  confidence: number;
  source: string;

  public constructor({ name, group, environment, confidence, source }: { name: string; group: string; environment: string; confidence: number; source: string }) {
    this.name = name;
    this.group = group;
    this.environment = environment;
    this.confidence = confidence;
    this.source = source;
  }

  public clone(): DepositType {
    return new DepositType({
      name: this.name,
      group: this.group,
      environment: this.environment,
      confidence: this.confidence,
      source: this.source,
    });
  }

  public static deserialize(obj: any): DepositType {
    return new DepositType({
      name: obj.name,
      group: obj.group,
      environment: obj.environment,
      confidence: obj.confidence,
      source: obj.source,
    });
  }
}
