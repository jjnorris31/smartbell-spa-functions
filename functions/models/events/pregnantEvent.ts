import {isDefined, IsNotEmpty, Validate} from "class-validator";

class PregnantEvent {
  id: string;

  @Validate(isDefined, {
    message: "date is required",
  })
  @IsNotEmpty()
  date: FirebaseFirestore.Timestamp;

  @Validate(isDefined, {
    message: "description is required",
  })
  @IsNotEmpty()
  description: string;

  @Validate(isDefined, {
    message: "lactation cycle is required",
  })
  @IsNotEmpty()
  lactationCycle: number;

  @Validate(isDefined, {
    message: "type is required",
  })
  @IsNotEmpty()
  type: string;

  @Validate(isDefined, {
    message: "bovineIdentifier is required",
  })
  @IsNotEmpty()
  bovineIdentifier: string;

  heatIdentifier: string;
}


export default PregnantEvent;
