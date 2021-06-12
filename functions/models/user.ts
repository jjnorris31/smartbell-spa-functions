import {Collection} from "fireorm";

import {
  isDefined,
  IsEmail,
  Validate,
  ArrayNotEmpty,
} from "class-validator";

@Collection()
class User {
    id: string;
    @Validate(isDefined, {
      message: "firstName is required",
    })
    firstName: string;
    @Validate(isDefined, {
      message: "firstSurname is required",
    })
    firstSurname: string;
    @IsEmail()
    email: string;
    @Validate(isDefined, {
      message: "phone is required",
    })
    phone: string;
    @Validate(isDefined, {
      message: "obBoarding is required",
    })
    obBoarding: boolean;
    @ArrayNotEmpty()
    roles: Array<string>
    @Validate(isDefined, {
      message: "authUniqueIdentifier is required",
    })
    authUniqueIdentifier: string;
}

export default User;
