export class CandidateEntity {
  source: string;
  confidence: number;
  observedName?: string;
  normalizedURI?: string;

  public constructor({ source, confidence, observedName, normalizedURI }: { source: string; confidence: number; observedName?: string; normalizedURI?: string }) {
    this.source = source;
    this.confidence = confidence;
    this.observedName = observedName;
    this.normalizedURI = normalizedURI;
  }

  public clone(): CandidateEntity {
    return new CandidateEntity({
      source: this.source,
      confidence: this.confidence,
      observedName: this.observedName,
      normalizedURI: this.normalizedURI,
    });
  }

  public static deserialize(obj: any): CandidateEntity {
    return new CandidateEntity({
      source: obj.source,
      confidence: obj.confidence,
      observedName: obj.observed_name,
      normalizedURI: obj.normalized_uri,
    });
  }

  public serialize(): object {
    return {
      source: this.source,
      confidence: this.confidence,
      observed_name: this.observedName,
      normalized_uri: this.normalizedURI,
    };
  }
}
