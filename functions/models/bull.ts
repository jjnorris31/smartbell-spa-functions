import {isDefined, IsNotEmpty, Validate} from "class-validator";

class Bull {
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

    @Validate(isDefined, {
      message: "groupIdentifier is required",
    })
    @IsNotEmpty()
    groupIdentifier: string;

    deleteAt: Date;
    internalIdentifier: string;
    siniigaIdentifier: string;
    name: string;
}

export default Bull;
