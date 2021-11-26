"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkBelongsRanch = exports.deleteFemaleAnimal = exports.incrementLactationCycle = exports.updateFemaleBovine = exports.updateFemaleBovines = exports.getAnimal = exports.getAllFemaleAnimals = exports.getAnimals = exports.createFemaleBovine = void 0;
const fireorm_1 = require("fireorm");
const utils_1 = require("../utils/utils");
const femaleBovine_1 = require("../models/femaleBovine");
const moment = require("moment");
const algolia_js_1 = require("../utils/algolia.js");
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
exports.createFemaleBovine = async (req, res) => {
    const repository = fireorm_1.getRepository(femaleBovine_1.default);
    const { ranchId } = req.params;
    const { internalIdentifier, siniigaIdentifier } = req.body;
    const femaleBovine = getFemaleBovineDocument(req.body);
    try {
        await checkUniqueInternalIdentifier(ranchId, internalIdentifier);
        await checkUniqueSiniigaIdentifier(siniigaIdentifier);
        const femaleBovineCreated = await repository.create(femaleBovine);
        algolia_js_1.default.saveObject({
            internalIdentifier: femaleBovineCreated.internalIdentifier,
            siniigaIdentifier: femaleBovineCreated.siniigaIdentifier,
            ranchIdentifier: femaleBovineCreated.ranchIdentifier,
        }, { autoGenerateObjectIDIfNotExist: true });
        return res.status(201).json(femaleBovineCreated);
    }
    catch (error) {
        res.status(400).send({
            error: error.message,
        });
    }
};
exports.getAnimals = async (req, res) => {
    const { limit, page, filter, values, search } = req.query;
    const { ranchId } = req.params;
    try {
        let foundFemaleAnimals = [];
        let slicedFemaleAnimals = [];
        foundFemaleAnimals = await exports.getAllFemaleAnimals(ranchId, []);
        switch (filter) {
            case "PREGNANT":
                const femaleWithLastPregnantEvents = await utils_1.getLastPregnantEvents(foundFemaleAnimals);
                foundFemaleAnimals = femaleWithLastPregnantEvents.filter((cow) => cow.lastPregnantDate);
                break;
            case "HEAT":
                const femaleWithHeatEvents = await utils_1.getLastHeatEvents(foundFemaleAnimals);
                foundFemaleAnimals = femaleWithHeatEvents.filter((cow) => cow.lastHeatDate);
                break;
        }
        slicedFemaleAnimals = limit && page ?
            foundFemaleAnimals.slice(limit * (page - 1), limit * (page)) : foundFemaleAnimals;
        return res.status(200).json(utils_1.getCowsResponse(slicedFemaleAnimals, foundFemaleAnimals.length));
    }
    catch (e) {
        return res.status(400).json(e);
    }
};
exports.getAllFemaleAnimals = async (ranchId) => {
    const repository = fireorm_1.getRepository(femaleBovine_1.default);
    const query = repository.whereEqualTo("ranchIdentifier", ranchId)
        .whereEqualTo("deleteAt", null)
        .whereEqualTo("isDead", false);
    return await query.find();
};
exports.getAnimal = async (req, res) => {
    const femaleBovineRepository = fireorm_1.getRepository(femaleBovine_1.default);
    const { ranchId, id } = req.params;
    try {
        const femaleBovine = await femaleBovineRepository
            .whereEqualTo("ranchIdentifier", ranchId)
            .whereEqualTo("deleteAt", null)
            .whereEqualTo("id", id).findOne();
        if (femaleBovine) {
            return res.status(200).json(femaleBovineResponse(femaleBovine));
        }
        else {
            return res.status(404).json();
        }
    }
    catch (error) {
        return res.status(404).json(error);
    }
};
exports.updateFemaleBovines = async (req, res) => {
    const repository = fireorm_1.getRepository(femaleBovine_1.default);
    const { ranchId } = req.params;
    const { internalIdentifiers, groupIdentifier, } = req.body;
    try {
        await fireorm_1.runTransaction(async (tran) => {
            const femaleBovineTransactionRepository = tran.getRepository(femaleBovine_1.default);
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
    }
    catch (e) {
        return res.status(209).json(e);
    }
};
exports.updateFemaleBovine = async (req, res) => {
    const femaleBovineRepository = fireorm_1.getRepository(femaleBovine_1.default);
    const { ranchId, id } = req.params;
    const { bovineIdentifier, breed, groupIdentifier, internalIdentifier, siniigaIdentifier, height, weight, } = req.body;
    try {
        await checkUpdateUniqueInternalIdentifier(ranchId, id, internalIdentifier);
        await checkUpdateUniqueSiniigaIdentifier(id, siniigaIdentifier);
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
        }
        else {
            res.status(400).send({
                error: "not found animal",
            });
        }
    }
    catch (error) {
        console.log({ error });
        res.status(400).send({
            error: error.message,
        });
    }
};
exports.incrementLactationCycle = async (req, res) => {
    var _a;
    const femaleBovineRepository = fireorm_1.getRepository(femaleBovine_1.default);
    try {
        const { bovineIdentifier, ranchIdentifier, } = req.body;
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
    }
    catch (error) {
        const constraintError = utils_1.getConstrainsError((_a = error[0]) === null || _a === void 0 ? void 0 : _a.constraints);
        const responseError = constraintError ? constraintError : utils_1.getDefaultError();
        return res.status(400).json(responseError);
    }
};
exports.deleteFemaleAnimal = async (req, res) => {
    const repository = fireorm_1.getRepository(femaleBovine_1.default);
    const { ranchId, id } = req.params;
    const { type } = req.query;
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
                femaleBovine.deleteAt = utils_1.getTimestampByDate(moment().format("YYYY-MM-DD"));
                await repository.update(femaleBovine);
                break;
            case "ERROR":
                await repository.delete(id);
                break;
            default:
                return res.status(404).send();
        }
        return res.status(204).send();
    }
    catch (e) {
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
    const repository = fireorm_1.getRepository(femaleBovine_1.default);
    const foundFemaleBovine = await repository
        .whereEqualTo("internalIdentifier", internalIdentifier)
        .whereEqualTo("ranchIdentifier", ranchId).findOne();
    if (internalIdentifier && foundFemaleBovine) {
        throw new Error("duplicated internal identifier");
    }
}
async function checkUniqueSiniigaIdentifier(siniigaIdentifier) {
    const repository = fireorm_1.getRepository(femaleBovine_1.default);
    const foundFemaleBovine = await repository
        .whereEqualTo("siniigaIdentifier", siniigaIdentifier)
        .findOne();
    if (siniigaIdentifier && foundFemaleBovine) {
        throw new Error("duplicated siniiga identifier");
    }
}
async function checkUpdateUniqueInternalIdentifier(ranchId, id, internalIdentifier) {
    const repository = fireorm_1.getRepository(femaleBovine_1.default);
    const foundFemaleBovine = await repository
        .whereEqualTo("internalIdentifier", internalIdentifier)
        .whereEqualTo("ranchIdentifier", ranchId).findOne();
    console.log("checkUpdateUniqueInternalIdentifier");
    console.log({ ranchId });
    console.log({ foundFemaleBovine });
    console.log({ internalIdentifier });
    console.log({ id });
    if (internalIdentifier && foundFemaleBovine && foundFemaleBovine.id !== id) {
        throw new Error("duplicated internal identifier");
    }
}
async function checkUpdateUniqueSiniigaIdentifier(id, siniigaIdentifier) {
    const repository = fireorm_1.getRepository(femaleBovine_1.default);
    const foundFemaleBovine = await repository
        .whereEqualTo("siniigaIdentifier", siniigaIdentifier)
        .findOne();
    console.log("checkUpdateUniqueSiniigaIdentifier");
    console.log({ foundFemaleBovine });
    console.log({ siniigaIdentifier });
    console.log({ id });
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
    const femaleBovine = new femaleBovine_1.default();
    femaleBovine.birthday = utils_1.getTimestampByDate(body.birthday);
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
exports.checkBelongsRanch = async (req, res, next) => {
    const repository = fireorm_1.getRepository(femaleBovine_1.default);
    const { ranchId } = req.params;
    try {
        const femaleBovine = await repository
            .whereEqualTo("ranchIdentifier", ranchId)
            .findOne();
        if (!femaleBovine) {
            return res.status(404).send();
        }
        next();
    }
    catch (_) {
        return res.status(404).send();
    }
};
//# sourceMappingURL=femaleBovine.controller.js.map