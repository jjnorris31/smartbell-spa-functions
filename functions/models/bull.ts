import {isDefined, IsNotEmpty, Validate} from "class-validator";
import {firestore} from "firebase-admin/lib/firestore";

class Bull {
    id: string;

    @Validate(isDefined, {
      message: "birthday is required",
    })
    @IsNotEmpty()
    birthday: firestore.Timestamp;

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

    deleteAt: firestore.Timestamp;
    internalIdentifier: string;
    siniigaIdentifier: string;
    name: string;
}

export default Bull;
