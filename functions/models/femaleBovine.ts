import {isDefined, IsNotEmpty, Validate} from "class-validator";
import {Collection, ISubCollection, SubCollection} from "fireorm";
import HeatEvent from "./events/heatEvent";
import CalvingEvent from "./events/calvingEvent";
import PregnantEvent from "./events/pregnantEvent";

@Collection()
class FemaleBovine {
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

  @Validate(isDefined, {
    message: "siniigaIdentifier is required",
  })
  @IsNotEmpty()
  siniigaIdentifier: string;

  @Validate(isDefined, {
    message: "lactationCycle is required",
  })
  @IsNotEmpty()
  lactationCycle: string;

  @Validate(isDefined, {
    message: "isHeifer is required",
  })
  @IsNotEmpty()
  isHeifer: boolean;

  @SubCollection(HeatEvent)
  heatEvents?: ISubCollection<HeatEvent>

  @SubCollection(CalvingEvent)
  calvingEvents?: ISubCollection<CalvingEvent>

  @SubCollection(PregnantEvent)
  pregnantEvents?: ISubCollection<PregnantEvent>

  maleParent: string;
  femaleParent: string;
  heatStatus: string;
  deleteAt: Date;
  height: string;
  weight: string;
  internalIdentifier: string;
  ranchIdentifier: string;
}

export default FemaleBovine;
