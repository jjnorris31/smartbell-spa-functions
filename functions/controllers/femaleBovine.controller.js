import Ranch from "../models/ranch";
import {getRepository} from "fireorm";
import {getConstrainsError, getDefaultError} from "../utils/utils";
import FemaleBovine from "../models/femaleBovine";
import {firestore} from "firebase-admin/lib/firestore";
import * as moment from "moment";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createFemaleBovine = async (req, res) => {
  const ranchRepository = getRepository(Ranch);

  try {
    const {
      breed,
      internalIdentifier,
      birthday,
      siniigaIdentifier,
      groupIdentifier,
      ranchIdentifier,
      lactationCycle,
      heatStatus,
      isHeifer,
    } = req.body;

    const ranchRef = await ranchRepository.findById(ranchIdentifier);
    const femaleBovine = await ranchRef.femaleBovines
        .whereEqualTo("internalIdentifier", internalIdentifier).findOne();

    if (femaleBovine) {
      return res.status(409).json({
        code: "duplicated",
        // eslint-disable-next-line max-len
        message: `a ${isHeifer ? "heifer" : "cow"} with this internal identifier was saved previously`,
      });
    }

    const newFemaleBovine = new FemaleBovine();
    newFemaleBovine.birthday = firestore.Timestamp
        .fromMillis(moment(birthday).valueOf());
    newFemaleBovine.breed = breed;
    newFemaleBovine.groupIdentifier = groupIdentifier;
    newFemaleBovine.ranchIdentifier = ranchIdentifier;
    newFemaleBovine.lactationCycle = lactationCycle;
    newFemaleBovine.isHeifer = isHeifer;
    newFemaleBovine.maleParent = null;
    newFemaleBovine.femaleParent = null;
    newFemaleBovine.heatStatus = heatStatus;
    newFemaleBovine.deleteAt = null;
    newFemaleBovine.height = null;
    newFemaleBovine.weight = null;
    newFemaleBovine.internalIdentifier = internalIdentifier;
    newFemaleBovine.siniigaIdentifier = siniigaIdentifier;

    const response = await ranchRef.femaleBovines.create(newFemaleBovine);
    return res.status(201).json({
      message: `a ${isHeifer ? "heifer" : "cow"} was created`,
      internalIdentifier: response.id,
    });
  } catch (error) {
    const constraintError = getConstrainsError(error[0]?.constraints);
    const responseError = constraintError ? constraintError : getDefaultError();
    return res.status(400).json(responseError);
  }
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getAnimal = async (req, res) => {
  const ranchRepository = getRepository(Ranch);
  const ranchIdentifier = req.query.ranch;
  const bovineIdentifier = req.query.bovine;

  try {
    const ranchRef = await ranchRepository.findById(ranchIdentifier);
    const femaleBovine = await ranchRef.femaleBovines
        .whereEqualTo("id", bovineIdentifier).findOne();

    if (femaleBovine) {
      return res.status(200).json(femaleBovineResponse(femaleBovine));
    }

    return res.status(404).json({
      code: "not found",
      // eslint-disable-next-line max-len
      message: "a bovine with this internal identifier was not found",
    });
  } catch (error) {
    const constraintError = getConstrainsError(error[0]?.constraints);
    const responseError = constraintError ? constraintError : getDefaultError();
    return res.status(400).json(responseError);
  }
};

function getLastCalving(date) {
  return {
    calvingEventIdentifier: false,
    date: date,
  };
}

function femaleBovineResponse(femaleBovine) {
  return {
    breed: femaleBovine.breed,
    birthday: femaleBovine.birthday,
    siniigaIdentifier: femaleBovine.siniigaIdentifier,
    lactationCycle: femaleBovine.lactationCycle,
    internalIdentifier: femaleBovine.internalIdentifier,
    id: femaleBovine.id,
    ranchIdentifier: femaleBovine.ranchIdentifier,
  };
}
