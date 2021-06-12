import Ranch from "../models/ranch";
import {getRepository} from "fireorm";
import {getConstrainsError, getDefaultError} from "../utils/utils";
import Bull from "../models/bull";
import {firestore} from "firebase-admin/lib/firestore";
import * as moment from "moment";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createBull = async (req, res) => {
  const ranchRepository = getRepository(Ranch);
  // const role = res.locals.role;
  //
  // if (!["admin"].includes(role)) {
  // 	return res.status(401).json({message: "Unauthorized to create a ranch", code: "role/unauthorized"});
  // }

  try {
    const {
      name,
      breed,
      internalIdentifier,
      birthday,
      siniigaIdentifier,
      groupIdentifier,
      ranchIdentifier,
    } = req.body;

    const ranchRef = await ranchRepository.findById(ranchIdentifier);

    const newBull = new Bull();
    newBull.name = name;
    newBull.breed = breed;
    newBull.internalIdentifier = internalIdentifier;
    newBull.birthday = firestore.Timestamp
        .fromMillis(moment(birthday).valueOf());
    newBull.siniigaIdentifier = siniigaIdentifier;
    newBull.groupIdentifier = groupIdentifier;
    await ranchRef.bulls.create(newBull);
    return res.status(201).json({
      message: "A bull was created",
    });
  } catch (error) {
    const constraintError = getConstrainsError(error[0]?.constraints);
    const responseError = constraintError ? constraintError : getDefaultError();
    return res.status(400).json(responseError);
  }
};
