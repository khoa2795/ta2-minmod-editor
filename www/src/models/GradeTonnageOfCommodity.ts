export class GradeTonnageOfCommodity {
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

  public clone(): GradeTonnageOfCommodity {
    return new GradeTonnageOfCommodity({
      commodity: this.commodity,
      totalTonnage: this.totalTonnage,
      totalGrade: this.totalGrade,
      totalContainedMetal: this.totalContainedMetal,
    });
  }

  public static deserialize(obj: any): GradeTonnageOfCommodity {
    return new GradeTonnageOfCommodity({
      commodity: obj.commodity,
      totalTonnage: obj.total_tonnage,
      totalGrade: obj.total_grade,
      totalContainedMetal: obj.total_contained_metal,
    });
  }
}
