import Ranch from "../models/ranch";
import {getRepository, runTransaction} from "fireorm";
import {getConstrainsError, getDefaultError, getTimestampByDate, getFemaleBovines} from "../utils/utils";
import FemaleBovine from "../models/femaleBovine";
import {firestore} from "firebase-admin/lib/firestore";
import * as moment from "moment";
import index from "../utils/algolia.js"
import Group from "../models/group";

export const createFemaleBovine = async (req, res) => {
  const repository = getRepository(FemaleBovine);
  const femaleBovine = getFemaleBovineDocument(req.body);
  try {
    const femaleBovineCreated = await repository.create(femaleBovine);
    index.saveObject({
      internalIdentifier: femaleBovineCreated.internalIdentifier,
      siniigaIdentifier: femaleBovineCreated.siniigaIdentifier,
      ranchIdentifier: femaleBovineCreated.ranchIdentifier
    }, {autoGenerateObjectIDIfNotExist: true});
    return res.status(201).json(femaleBovineCreated);
  } catch (_) {
    return res.status(200).json(
      {
        code: "creating error",
        message: `an error has occurred while creating the female bovine`,
      }
    );
  }
};

export const getAnimals = async (req, res) => {
  try {
    const response = await getFemaleBovines('COWS', req);
    console.log({response});
    return res.status(200).json(response);
  } catch (error) {
    const constraintError = getConstrainsError(error[0]?.constraints);
    const responseError = constraintError ? constraintError : getDefaultError(error);
    return res.status(400).json(responseError);
  }
};

export const getAnimal = async (req, res) => {
  const femaleBovineRepository = getRepository(FemaleBovine);
  const { ranchId, id } = req.params;
  try {
    const femaleBovine = await femaleBovineRepository
        .whereEqualTo("ranchIdentifier", ranchId)
        .whereEqualTo("deleteAt", null)
        .whereEqualTo("id", id).findOne();
    if (femaleBovine) {
      return res.status(200).json(femaleBovineResponse(femaleBovine));
    } else {
      return res.status(404).json();
    }
  } catch (error) {
    return res.status(404).json(error);
  }
};

export const updateFemaleBovines = async (req, res) => {
  const repository = getRepository(FemaleBovine);
  const { ranchId } = req.params;

  const {
    internalIdentifiers,
    groupIdentifier,
  } = req.body;

  try {
    await runTransaction(async tran => {
      const femaleBovineTransactionRepository = tran.getRepository(FemaleBovine);
      let femaleBovinesToUpdate = [];

      for (const id of internalIdentifiers) {
        // todo change to promise all
        let femaleBovine = await femaleBovineTransactionRepository
          .whereEqualTo("id", id)
          .whereEqualTo("ranchIdentifier", ranchId).findOne();
        femaleBovinesToUpdate.push(femaleBovine);
      }

      for (const femaleBovine of femaleBovinesToUpdate) {
        femaleBovine.groupIdentifier = groupIdentifier;
        await femaleBovineTransactionRepository.update(femaleBovine);
      }
    });
    return res.status(200).send();
  } catch (e) {
    return res.status(209).json(e);
  }

}

export const updateFemaleBovine = async (req, res) => {
  const femaleBovineRepository = getRepository(FemaleBovine);

  const {
    ranchIdentifier,
    bovineIdentifier,
    breed,
    groupIdentifier,
    internalIdentifier,
    siniigaIdentifier,
    height,
    weight
  } = req.body;
  try {
    const femaleBovine = await femaleBovineRepository.findById(bovineIdentifier);
    if (femaleBovine) {
      femaleBovine.breed = breed;
      femaleBovine.groupIdentifier = groupIdentifier;
      femaleBovine.internalIdentifier = internalIdentifier;
      femaleBovine.siniigaIdentifier = siniigaIdentifier;
      femaleBovine.height = height ? parseFloat(height) : null;
      femaleBovine.weight = weight ? parseFloat(weight) : null;
      await femaleBovineRepository.update(femaleBovine);
      return res.status(200).send();
    } else {
      return res.status(209).json();
    }
  } catch (error) {
    return res.status(209).json(error);
  }
};

export const incrementLactationCycle = async (req, res) => {
  const femaleBovineRepository = getRepository(FemaleBovine);
  try {
    const {
      bovineIdentifier,
      ranchIdentifier,
    } = req.body;

    const femaleBovine = await femaleBovineRepository
      .whereEqualTo("ranchIdentifier", ranchIdentifier)
      .whereEqualTo("id", bovineIdentifier).findOne();

    if (!femaleBovine) {
      return res.status(404).json({
        code: "not found",
        // eslint-disable-next-line max-len
        message: "a bovine with this internal identifier was not found",
      });
    }

    femaleBovine.lactationCycle++;
    await femaleBovineRepository.update(femaleBovine);
    return res.status(200).json({
      message: `the lactation cycle was updated`,
      bovineIdentifier: bovineIdentifier,
    });
  } catch (error) {
    const constraintError = getConstrainsError(error[0]?.constraints);
    const responseError = constraintError ? constraintError : getDefaultError();
    return res.status(400).json(responseError);
  }
}

export const deleteFemaleAnimal = async (req, res) => {
  const repository = getRepository(FemaleBovine);
  const { ranchId, id } = req.params;
  const { type } = req.query;
  try {
    let femaleBovine = await repository
      .whereEqualTo("ranchIdentifier", ranchId)
      .whereEqualTo("id", id).findOne();
    switch (type) {
      case 'DEAD':
        femaleBovine.isDead = true;
        await repository.update(femaleBovine);
        break;
      case 'SALE':
      case 'CATTLE':
        femaleBovine.deleteAt = getTimestampByDate(moment().format('YYYY-MM-DD'));
        await repository.update(femaleBovine);
        break;
      case 'ERROR':
        await repository.delete(id);
        break;
      default:
        return res.status(404).send();
    }
    return res.status(204).send();
  } catch (e) {
    return res.status(404).send();
  }
}

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
    height: femaleBovine.height,
    weight: femaleBovine.weight
  };
}

/**
 * Checks if a given internal id was previously registered in a given ranch
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
export const checkUniqueInternalId = async (req, res, next) => {
  const repository = getRepository(FemaleBovine);
  const { ranchId, id } = req.params;
  const { internalIdentifier } = req.body;
  try {
    const foundFemaleBovine = await repository
      .whereEqualTo("internalIdentifier", internalIdentifier)
      .whereEqualTo("ranchIdentifier", ranchId).findOne();

    if (foundFemaleBovine) {
      if (id) {
        // updating female bovine
        if (id === foundFemaleBovine.id) {
          next();
        } else {
          return res.status(209).json({
            code: "internal id duplicated",
            message: `a female bovine with this internal identifier was saved previously in this ranch`,
          });
        }
      } else {
        // new female bovine
        return res.status(409).json({
          code: "internal id duplicated",
          message: `a female bovine with this internal identifier was saved previously in this ranch`,
        });
      }
    } else {
      next();
    }
  } catch (e) {
    return res.status(200).json(
      {
        code: "checking error",
        message: `an error has occurred while checking the internal identifier`,
      }
    );
  }
}

/**
 * Checks if a given internal id was previously registered in the database
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
export const checkUniqueSiniigaId = async (req, res, next) => {
  const repository = getRepository(FemaleBovine);
  const { ranchId, id } = req.params;
  const { siniigaIdentifier } = req.body;
  try {
    const foundBull = await repository
      .whereEqualTo("siniigaIdentifier", siniigaIdentifier).findOne();
    if (foundBull) {
      if (id) {
        // updating female bovine
        if (id === foundBull.id) {
          next();
        } else {
          return res.status(209).json({
            code: "siniiga id duplicated",
            message: `a female bovine with this siniiga identifier was saved previously in the database`,
          });
        }
      } else {
        // new female bovine
        return res.status(409).json({
          code: "siniiga id duplicated",
          message: `a female bovine with this siniiga identifier was saved previously in the database`,
        });
      }
    } else {
      next();
    }
  } catch (_) {
    return res.status(200).json(
      {
        code: "checking error",
        message: `an error has occurred while checking the siniiga identifier`,
      }
    );
  }
}

/**
 * Gets an female bovine collection from a request body
 * @param body a request body
 * @returns {FemaleBovine}
 */
function getFemaleBovineDocument(body) {
  const femaleBovine = new FemaleBovine();
  femaleBovine.birthday = getTimestampByDate(body.birthday);
  femaleBovine.breed = body.breed;
  femaleBovine.groupIdentifier = body.groupIdentifier;
  femaleBovine.ranchIdentifier = body.ranchIdentifier;
  femaleBovine.lactationCycle = parseInt(body.lactationCycle);
  femaleBovine.isHeifer = body.isHeifer;
  femaleBovine.maleParent = null;
  femaleBovine.femaleParent = null;
  femaleBovine.heatStatus = body.heatStatus;
  femaleBovine.deleteAt = null;
  femaleBovine.height = null;
  femaleBovine.weight = null;
  femaleBovine.isDead = false;
  femaleBovine.internalIdentifier = body.internalIdentifier;
  femaleBovine.siniigaIdentifier = body.siniigaIdentifier;
  return femaleBovine;
}

/**
 * Checks if a given female bovine belongs to a given ranch
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
export const checkBelongsRanch = async (req, res, next) => {
  const repository = getRepository(FemaleBovine);
  const { ranchId } = req.params;
  try {
    const femaleBovine = await repository
      .whereEqualTo("ranchIdentifier", ranchId)
      .findOne();
    if (!femaleBovine) {
      return res.status(404).send();
    }
    next();
  } catch (_) {
    return res.status(404).send();
  }
}
