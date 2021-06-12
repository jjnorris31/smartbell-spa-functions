import {Collection, ISubCollection, SubCollection, Type} from "fireorm";
import {
  isDefined,
  Validate,
  IsNotEmpty,
  IsDate,
} from "class-validator";
import Bull from "../models/bull";

// eslint-disable-next-line new-cap,require-jsdoc
@Collection()
class Ranch {
    id: string;

    @Validate(isDefined, {
      message: "name is required",
    })
    @IsNotEmpty()
    name: string;

    @Validate(isDefined, {
      message: "position is required",
    })
    @Type(() => Geopoint)
    position: Geopoint;

    @Validate(isDefined, {
      message: "address is required",
    })
    @IsNotEmpty()
    address: string;

    @Validate(isDefined, {
      message: "userIdentifier is required",
    })
    userIdentifier: string;

    @Validate(IsDate, {
      message: "createDate is required",
    })
    createDate: Date;

    @SubCollection(Bull)
    bulls?: ISubCollection<Bull>
}

export class Geopoint {
    latitude: number;
    longitude: number;
}

export default Ranch;
