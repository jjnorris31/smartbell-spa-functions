import {isDefined, IsNotEmpty, Validate} from "class-validator";

class Animal {
    id: string;

    @Validate(isDefined, {
      message: "birthday is required",
    })
    @IsNotEmpty()
    birthday: string;

    @Validate(isDefined, {
      message: "breed is required",
    })
    @IsNotEmpty()
    breed: string;

    maleParent: string;
    femaleParent: string;

    @Validate(isDefined, {
      message: "groupIdentifier is required",
    })
    @IsNotEmpty()
    groupIdentifier: string;

    heatStatus: string;
    deleteAt: Date;
    height: string;
    weight: string;
    internalIdentifier: string;
    siniigaIdentifier: string;
    lastPregnantDate: string;
    lastCalving: Calving;
    isHeifer: false;

    @Validate(isDefined, {
      message: "lactationCycle is required",
    })
    @IsNotEmpty()
    lactationCycle: string;
}

class Calving {
    abort: boolean;
    calvingEventIdentifier: string;
    date: Date;
}

export default Animal;
