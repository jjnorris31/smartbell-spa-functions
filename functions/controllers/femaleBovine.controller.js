import {getRepository, runTransaction} from "fireorm";

import {
  getConstrainsError,
  getDefaultError,
  getTimestampByDate,
  getLastPregnantEvents,
  getCowsResponse, getLastHeatEvents,
} from "../utils/utils";
import FemaleBovine from "../models/femaleBovine";
import * as moment from "moment";
import index from "../utils/algolia.js";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createFemaleBovine = async (req, res) => {
  const repository = getRepository(FemaleBovine);
  const {ranchId} = req.params;
  const {internalIdentifier, siniigaIdentifier} = req.body;
  const femaleBovine = getFemaleBovineDocument(req.body);
  try {
    await checkUniqueInternalIdentifier(ranchId, internalIdentifier);
    await checkUniqueSiniigaIdentifier(siniigaIdentifier);
    const femaleBovineCreated = await repository.create(femaleBovine);
    index.saveObject({
      internalIdentifier: femaleBovineCreated.internalIdentifier,
      siniigaIdentifier: femaleBovineCreated.siniigaIdentifier,
      ranchIdentifier: femaleBovineCreated.ranchIdentifier,
    }, {autoGenerateObjectIDIfNotExist: true});
    return res.status(201).json(femaleBovineCreated);
  } catch (error) {
    res.status(400).send({
      error: error.message,
    });
  }
};

export const getAnimals = async (req, res) => {
  const {limit, page, filter, values, search} = req.query;
  const {ranchId} = req.params;

  try {
    let foundFemaleAnimals = [];
    let slicedFemaleAnimals = [];
    foundFemaleAnimals = await getAllFemaleAnimals(ranchId, []);

    switch (filter) {
      case "PREGNANT":
        const femaleWithLastPregnantEvents = await getLastPregnantEvents(foundFemaleAnimals);
        foundFemaleAnimals = femaleWithLastPregnantEvents.filter((cow) => cow.lastPregnantDate);
        break;
      case "HEAT":
        const femaleWithHeatEvents = await getLastHeatEvents(foundFemaleAnimals);
        foundFemaleAnimals = femaleWithHeatEvents.filter((cow) => cow.lastHeatDate);
        break;
    }

    slicedFemaleAnimals = limit && page ?
      foundFemaleAnimals.slice(limit * (page - 1), limit * (page)) : foundFemaleAnimals;
    return res.status(200).json(getCowsResponse(slicedFemaleAnimals, foundFemaleAnimals.length));
  } catch (e) {
    return res.status(400).json(e);
  }
};

export const getAllFemaleAnimals = async (ranchId) => {
  const repository = getRepository(FemaleBovine);
  const query = repository.whereEqualTo("ranchIdentifier", ranchId)
      .whereEqualTo("deleteAt", null)
      .whereEqualTo("isDead", false);
  return await query.find();
};

export const getAnimal = async (req, res) => {
  const femaleBovineRepository = getRepository(FemaleBovine);
  const {ranchId, id} = req.params;
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
  const {ranchId} = req.params;

  const {
    internalIdentifiers,
    groupIdentifier,
  } = req.body;

  try {
    await runTransaction(async (tran) => {
      const femaleBovineTransactionRepository = tran.getRepository(FemaleBovine);
      const femaleBovinesToUpdate = [];

      for (const id of internalIdentifiers) {
        // todo change to promise all
        const femaleBovine = await femaleBovineTransactionRepository
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
};

export const updateFemaleBovine = async (req, res) => {
  const femaleBovineRepository = getRepository(FemaleBovine);
  const {ranchId, id} = req.params;

  const {
    bovineIdentifier,
    breed,
    groupIdentifier,
    internalIdentifier,
    siniigaIdentifier,
    height,
    weight,
  } = req.body;
  try {
    await checkUpdateUniqueInternalIdentifier(
        ranchId,
        id,
        internalIdentifier
    );
    await checkUpdateUniqueSiniigaIdentifier(
        id,
        siniigaIdentifier
    );
    const femaleBovine = await femaleBovineRepository
        .findById(id);
    if (femaleBovine) {
      femaleBovine.breed = breed;
      femaleBovine.groupIdentifier = groupIdentifier;
      femaleBovine.internalIdentifier = internalIdentifier;
      femaleBovine.siniigaIdentifier = siniigaIdentifier;
      femaleBovine.height = height ? parseFloat(height) : null;
      femaleBovine.weight = weight ? parseFloat(weight) : null;
      await femaleBovineRepository.update(femaleBovine);
      res.status(200).send();
    } else {
      res.status(400).send({
        error: "not found animal",
      });
    }
  } catch (error) {
    console.log({error});
    res.status(400).send({
      error: error.message,
    });
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
      message: "the lactation cycle was updated",
      bovineIdentifier: bovineIdentifier,
    });
  } catch (error) {
    const constraintError = getConstrainsError(error[0]?.constraints);
    const responseError = constraintError ? constraintError : getDefaultError();
    return res.status(400).json(responseError);
  }
};

export const deleteFemaleAnimal = async (req, res) => {
  const repository = getRepository(FemaleBovine);
  const {ranchId, id} = req.params;
  const {type} = req.query;
  try {
    const femaleBovine = await repository
        .whereEqualTo("ranchIdentifier", ranchId)
        .whereEqualTo("id", id).findOne();
    switch (type) {
      case "DEAD":
        femaleBovine.isDead = true;
        await repository.update(femaleBovine);
        break;
      case "SALE":
      case "CATTLE":
        femaleBovine.deleteAt = getTimestampByDate(moment().format("YYYY-MM-DD"));
        await repository.update(femaleBovine);
        break;
      case "ERROR":
        await repository.delete(id);
        break;
      default:
        return res.status(404).send();
    }
    return res.status(204).send();
  } catch (e) {
    return res.status(404).send();
  }
};

function getLastCalving(date) {
  return {
    calvingEventIdentifier: false,
    date: date,
  };
}

async function checkUniqueInternalIdentifier(ranchId, internalIdentifier) {
  const repository = getRepository(FemaleBovine);
  const foundFemaleBovine = await repository
      .whereEqualTo("internalIdentifier", internalIdentifier)
      .whereEqualTo("ranchIdentifier", ranchId).findOne();
  if (internalIdentifier && foundFemaleBovine) {
    throw new Error("duplicated internal identifier");
  }
}

async function checkUniqueSiniigaIdentifier(siniigaIdentifier) {
  const repository = getRepository(FemaleBovine);
  const foundFemaleBovine = await repository
      .whereEqualTo("siniigaIdentifier", siniigaIdentifier)
      .findOne();

  if (siniigaIdentifier && foundFemaleBovine) {
    throw new Error("duplicated siniiga identifier");
  }
}

async function checkUpdateUniqueInternalIdentifier(ranchId, id, internalIdentifier) {
  const repository = getRepository(FemaleBovine);
  const foundFemaleBovine = await repository
      .whereEqualTo("internalIdentifier", internalIdentifier)
      .whereEqualTo("ranchIdentifier", ranchId).findOne();
  console.log("checkUpdateUniqueInternalIdentifier");
  console.log({ranchId});
  console.log({foundFemaleBovine});
  console.log({internalIdentifier});
  console.log({id});
  if (internalIdentifier && foundFemaleBovine && foundFemaleBovine.id !== id) {
    throw new Error("duplicated internal identifier");
  }
}

async function checkUpdateUniqueSiniigaIdentifier(id, siniigaIdentifier) {
  const repository = getRepository(FemaleBovine);
  const foundFemaleBovine = await repository
      .whereEqualTo("siniigaIdentifier", siniigaIdentifier)
      .findOne();
  console.log("checkUpdateUniqueSiniigaIdentifier");
  console.log({foundFemaleBovine});
  console.log({siniigaIdentifier});
  console.log({id});
  if (siniigaIdentifier && foundFemaleBovine && foundFemaleBovine.id !== id) {
    throw new Error("duplicated siniiga identifier");
  }
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
    weight: femaleBovine.weight,
  };
}

/**
 * Gets an female bovine collection from a request body
 * @param body a request body
 * @return {FemaleBovine}
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
  femaleBovine.siniigaIdentifier = body.siniigaIdentifier === "" ? null : body.siniigaIdentifier;
  return femaleBovine;
}

/**
 * Checks if a given female bovine belongs to a given ranch
 * @param req
 * @param res
 * @param next
 * @return {Promise<*>}
 */
export const checkBelongsRanch = async (req, res, next) => {
  const repository = getRepository(FemaleBovine);
  const {ranchId} = req.params;
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
};
