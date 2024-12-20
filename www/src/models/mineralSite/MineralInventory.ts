import { IStore } from "models";
import { CandidateEntity } from "./CandidateEntity";
import { GradeTonnage } from "./GradeTonnage";
import { Reference } from "./Reference";

export class MineralInventory {
  category: CandidateEntity[];
  commodity: CandidateEntity;
  grade?: Measure;
  ore?: Measure;
  reference: Reference;

  public constructor({ category, commodity, grade, ore, reference }: { category: CandidateEntity[]; commodity: CandidateEntity; grade?: Measure; ore?: Measure; reference: Reference }) {
    this.category = category;
    this.commodity = commodity;
    this.grade = grade;
    this.ore = ore;
    this.reference = reference;
  }

  public static fromGradeTonnage(stores: IStore, createdBy: string, gradeTonnage: GradeTonnage, reference: Reference): MineralInventory {
    const commodity = stores.commodityStore.get(gradeTonnage.commodity)!;

    return new MineralInventory({
      category: ["Inferred", "Indicated", "Measured"].map(
        (name) => new CandidateEntity({ source: createdBy, confidence: 1.0, observedName: name, normalizedURI: "https://minmod.isi.edu/resource/" + name })
      ),
      commodity: new CandidateEntity({
        source: createdBy,
        confidence: 1.0,
        observedName: commodity.name,
        normalizedURI: commodity.uri,
      }),
      grade:
        gradeTonnage.totalGrade === undefined
          ? undefined
          : new Measure({
              value: gradeTonnage.totalGrade,
              unit: new CandidateEntity({
                source: createdBy,
                confidence: 1.0,
                observedName: "%",
                normalizedURI: "https://minmod.isi.edu/resource/Q201",
              }),
            }),
      ore:
        gradeTonnage.totalTonnage === undefined
          ? undefined
          : new Measure({
              value: gradeTonnage.totalTonnage,
              unit: new CandidateEntity({
                source: createdBy,
                confidence: 1.0,
                observedName: "%",
                normalizedURI: "https://minmod.isi.edu/resource/Q202",
              }),
            }),
      reference: reference,
    });
  }

  public static deserialize(obj: any): MineralInventory {
    return new MineralInventory({
      category: obj.category === undefined ? [] : obj.category.map(CandidateEntity.deserialize),
      commodity: CandidateEntity.deserialize(obj.commodity),
      grade: obj.grade === undefined ? undefined : Measure.deserialize(obj.grade),
      ore: obj.ore === undefined ? undefined : Measure.deserialize(obj.ore),
      reference: Reference.deserialize(obj.reference),
    });
  }
}

export class Measure {
  value: number;
  unit?: CandidateEntity;

  public constructor({ value, unit }: { value: number; unit?: CandidateEntity }) {
    this.value = value;
    this.unit = unit;
  }

  public static deserialize(obj: any): Measure {
    return new Measure({
      value: obj.value,
      unit: obj.unit === undefined ? undefined : CandidateEntity.deserialize(obj.unit),
    });
  }
}
