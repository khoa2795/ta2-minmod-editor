export class GradeTonnage {
  commodity: string;
  totalTonnage?: number;
  totalGrade?: number;
  totalContainedMetal?: number;

  public constructor({ commodity, totalTonnage, totalGrade, totalContainedMetal }: { commodity: string; totalTonnage?: number; totalGrade?: number; totalContainedMetal?: number }) {
    this.commodity = commodity;
    this.totalTonnage = totalTonnage;
    this.totalGrade = totalGrade;
    this.totalContainedMetal = totalContainedMetal;
  }

  public clone(): GradeTonnage {
    return new GradeTonnage({
      commodity: this.commodity,
      totalTonnage: this.totalTonnage,
      totalGrade: this.totalGrade,
      totalContainedMetal: this.totalContainedMetal,
    });
  }

  public static deserialize(obj: any): GradeTonnage {
    return new GradeTonnage({
      commodity: obj.commodity,
      totalTonnage: obj.total_tonnage,
      totalGrade: obj.total_grade,
      totalContainedMetal: obj.total_contained_metal,
    });
  }
}
