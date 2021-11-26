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
      message: "onBoarding is required",
    })
    onBoarding: boolean;
    @ArrayNotEmpty()
    roles: Array<string>
    @Validate(isDefined, {
      message: "authUniqueIdentifier is required",
    })
    @ArrayNotEmpty()
    alerts: Array<Alert>
    authUniqueIdentifier: string;

    pushNotificationToken: string;
}

export interface Alert {
  type: string,
  active: boolean
}

export default User;
