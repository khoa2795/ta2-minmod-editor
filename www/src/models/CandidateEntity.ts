export class CandidateEntity {
  source: string;
  confidence: number;
  observed_name?: string;
  normalized_uri?: string;

  public constructor({
    source,
    confidence,
    observed_name,
    normalized_uri,
  }: {
    source: string;
    confidence: number;
    observed_name?: string;
    normalized_uri?: string;
  }) {
    this.source = source;
    this.confidence = confidence;
    this.observed_name = observed_name;
    this.normalized_uri = normalized_uri;
  }

  public static deserialize(obj: any): CandidateEntity {
    return new CandidateEntity({ ...obj });
  }

  public clone(): CandidateEntity {
    return new CandidateEntity({
      source: this.source,
      confidence: this.confidence,
      observed_name: this.observed_name,
      normalized_uri: this.normalized_uri,
    });
  }
}
