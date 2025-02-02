export class RockType {
  unit?: string;
  type?: string;

  public constructor({ unit, type }: { unit?: string; type?: string }) {
    this.unit = unit;
    this.type = type;
  }

  public serialize() {
    return {
      unit: this.unit,
      type: this.type,
    };
  }
}

export class GeologyInfo {
  alternation?: string;
  concentrationProcess?: string;
  oreControl?: string;
  hostRock?: RockType;
  associatedRock?: RockType;
  structure?: string;
  tectonic?: string;

  public constructor({
    alternation,
    concentrationProcess,
    oreControl,
    hostRock,
    associatedRock,
    structure,
    tectonic,
  }: {
    alternation?: string;
    concentrationProcess?: string;
    oreControl?: string;
    hostRock?: RockType;
    associatedRock?: RockType;
    structure?: string;
    tectonic?: string;
  }) {
    this.alternation = alternation;
    this.concentrationProcess = concentrationProcess;
    this.oreControl = oreControl;
    this.hostRock = hostRock;
    this.associatedRock = associatedRock;
    this.structure = structure;
    this.tectonic = tectonic;
  }

  public static deserialize(obj: any) {
    return new GeologyInfo({
      alternation: obj.alternation,
      concentrationProcess: obj.concentration_process,
      oreControl: obj.ore_control,
      hostRock: obj.host_rock === undefined ? undefined : new RockType(obj.host_rock),
      associatedRock: obj.associated_rock === undefined ? undefined : new RockType(obj.associated_rock),
      structure: obj.structure,
      tectonic: obj.tectonic,
    });
  }

  public serialize() {
    return {
      alternation: this.alternation,
      concentration_process: this.concentrationProcess,
      ore_control: this.oreControl,
      host_rock: this.hostRock?.serialize(),
      associated_rock: this.associatedRock?.serialize(),
      structure: this.structure,
      tectonic: this.tectonic,
    };
  }
}
