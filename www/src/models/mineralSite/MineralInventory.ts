import { CandidateEntity } from "./CandidateEntity";
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
  unit: CandidateEntity;

  public constructor({ value, unit }: { value: number; unit: CandidateEntity }) {
    this.value = value;
    this.unit = unit;
  }

  public static deserialize(obj: any): Measure {
    return new Measure({
      value: obj.value,
      unit: CandidateEntity.deserialize(obj.unit),
    });
  }
}
