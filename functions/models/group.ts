import {isDefined, IsNotEmpty, Validate} from "class-validator";
import {firestore} from "firebase-admin/lib/firestore";
import {Collection} from "fireorm";

@Collection()
class Group {
  id: string;

  @Validate(isDefined, {
    message: "createdAt is required",
  })
  @IsNotEmpty()
  createdAt: firestore.Timestamp;

  @Validate(isDefined, {
    message: "description is required",
  })
  @IsNotEmpty()
  description: string;

  @Validate(isDefined, {
    message: "KPI is required",
  })
  @IsNotEmpty()
  KPI: string;

  @Validate(isDefined, {
    message: "name is required",
  })
  @IsNotEmpty()
  name: string;

  @Validate(isDefined, {
    message: "ranchIdentifier is required",
  })
  @IsNotEmpty()
  ranchIdentifier: string;

  @Validate(isDefined, {
    message: "type is required",
  })
  @IsNotEmpty()
  type: string;
}

export default Group;
