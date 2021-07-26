import Ranch from "../models/ranch";
import {getRepository} from "fireorm";
import {getConstrainsError, getDefaultError} from "../utils/utils";
import Bull from "../models/bull";
import {firestore} from "firebase-admin/lib/firestore";
import * as moment from "moment";
import FemaleBovine from "../models/femaleBovine";


// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createBull = async (req, res) => {
  const bullRepository = getRepository(Bull);

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

    const foundInternalIdentifier = await bullRepository
      .whereEqualTo("internalIdentifier", internalIdentifier).findOne();

    const foundSiniigaIdentifier = await bullRepository
      .whereEqualTo("siniigaIdentifier", siniigaIdentifier).findOne();

    if (foundInternalIdentifier) {
      return res.status(409).json({
        code: "internal duplicated",
        // eslint-disable-next-line max-len
        message: `a bull with this internal identifier was saved previously`,
      });
    }

    if (foundSiniigaIdentifier) {
      return res.status(409).json({
        code: "siniiga duplicated",
        // eslint-disable-next-line max-len
        message: `a bull with this siniiga identifier was saved previously`,
      });
    }

    const newBull = new Bull();
    newBull.name = name;
    newBull.breed = breed;
    newBull.internalIdentifier = internalIdentifier;
    newBull.ranchIdentifier = ranchIdentifier;
    newBull.birthday = firestore.Timestamp
        .fromMillis(moment(birthday).valueOf());
    newBull.siniigaIdentifier = siniigaIdentifier;
    newBull.groupIdentifier = groupIdentifier;

    await bullRepository.create(newBull);
    return res.status(201).json({
      message: "A bull was created",
    });
  } catch (error) {
    const constraintError = getConstrainsError(error[0]?.constraints);
    const responseError = constraintError ? constraintError : getDefaultError(error);
    return res.status(400).json(responseError);
  }
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getAllBulls = async (req, res) => {
  const ranchRepository = getRepository(Ranch);
  try {
    const ranchIdentifier = req.query.ranch;

    const ranchRef = await ranchRepository.findById(ranchIdentifier);
    const bulls = await ranchRef.bulls.find();
    return res.status(200).json(bulls);
  } catch (error) {
    const constraintError = getConstrainsError(error[0]?.constraints);
    const responseError = constraintError ? constraintError : getDefaultError(error);
    return res.status(400).json(responseError);
  }
};

export const getBull = async (req, res) => {
  const bullRepository = getRepository(Bull);
  const ranchIdentifier = req.query.ranch;
  const bovineIdentifier = req.query.bovine;

  try {
    const bull = await bullRepository
      .whereEqualTo("ranchIdentifier", ranchIdentifier)
      .whereEqualTo("id", bovineIdentifier).findOne();

    if (bull) {
      return res.status(200).json(bullResponse(bull));
    }

    return res.status(404).json({
      code: "not found",
      message: "a bull  with this id was not found",
    });
  } catch (error) {
    const constraintError = getConstrainsError(error[0]?.constraints);
    const responseError = constraintError ? constraintError : getDefaultError(error);
    return res.status(400).json(responseError);
  }
}

export const updateBull = async (req, res) => {
  const bullRepository = getRepository(Bull);
  const {
    bovineIdentifier,
    breed,
    internalIdentifier,
    siniigaIdentifier,
    name,
    birthday
  } = req.body;

  try {
    const bull = await bullRepository.findById(bovineIdentifier);
    if (bull) {
      bull.breed = breed;
      bull.internalIdentifier = internalIdentifier;
      bull.siniigaIdentifier = siniigaIdentifier;
      bull.birthday = firestore.Timestamp
        .fromMillis(moment(birthday).valueOf());
      bull.name = name;

      await bullRepository.update(bull);
      return res.status(200).send();
    }

    return res.status(404).json({
      code: "not found",
      // eslint-disable-next-line max-len
      message: "a bull with this id was not found",
    });
  } catch (error) {
    const constraintError = getConstrainsError(error[0]?.constraints);
    const responseError = constraintError ? constraintError : getDefaultError(error);
    return res.status(400).json(responseError);
  }
}

export const checkDuplicatedBull = async (req, res, next) => {
  const bullRepository = getRepository(Bull);
  const {
    bovineIdentifier,
    internalIdentifier,
    siniigaIdentifier,
    name
  } = req.body;

  try {

    const duplicatedInternalIdentifier = await bullRepository
      .whereEqualTo('internalIdentifier', internalIdentifier).findOne();

    const duplicatedSiniigaIdentifier = await bullRepository
      .whereEqualTo('siniigaIdentifier', siniigaIdentifier).findOne();

    const duplicatedName = await bullRepository
      .whereEqualTo('name', name).findOne();

    if (duplicatedInternalIdentifier && duplicatedInternalIdentifier?.id !== bovineIdentifier) {
      duplicatedResponse(res, 'internal identifier')
    } else if (duplicatedSiniigaIdentifier && duplicatedSiniigaIdentifier?.id !== bovineIdentifier) {
      duplicatedResponse(res, 'siniiga identifier')
    } else if (duplicatedName && duplicatedName?.id !== bovineIdentifier) {
      duplicatedResponse(res, 'name')
    } else {
      next();
    }
  } catch (error) {
    const constraintError = getConstrainsError(error[0]?.constraints);
    const responseError = constraintError ? constraintError : getDefaultError(error);
    return res.status(400).json(responseError);
  }
}

function bullResponse(bull) {
  return {
    breed: bull.breed,
    birthday: bull.birthday,
    siniigaIdentifier: bull.siniigaIdentifier,
    internalIdentifier: bull.internalIdentifier,
    name: bull.name,
    id: bull.id,
  };
}

function duplicatedResponse(res, duplicatedItem) {
  return res.status(404).json({
    code: "duplicated",
    message: `a bull with this ${duplicatedItem} was found`,
  });
}
