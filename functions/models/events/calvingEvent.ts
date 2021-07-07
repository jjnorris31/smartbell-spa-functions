import {isDefined, IsNotEmpty, Validate} from "class-validator";

class CalvingEvent {
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
  lactationCycle: string;

  @Validate(isDefined, {
    message: "type is required",
  })
  @IsNotEmpty()
  type: string;

  abortReason: string;
  sickness: string;
}


export default CalvingEvent;
