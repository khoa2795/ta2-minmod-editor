export class CandidateEntity {
  source: string;
  confidence: number;
  observed_name?: string;
  normalized_uri?: string;

  public constructor(
    source: string,
    confidence: number,
    observed_name?: string,
    normalized_uri?: string
  ) {
    this.source = source;
    this.confidence = confidence;
    this.observed_name = observed_name;
    this.normalized_uri = normalized_uri;
  }

  public static deserialize(obj: any): CandidateEntity {
    return new CandidateEntity(
      obj.source,
      obj.confidence,
      obj.observed_name,
      obj.normalized_uri
    );
  }

  public clone(): CandidateEntity {
    return new CandidateEntity(
      this.source,
      this.confidence,
      this.observed_name,
      this.normalized_uri
    );
  }
}
