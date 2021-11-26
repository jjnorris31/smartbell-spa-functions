"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUniqueName = exports.checkUniqueSiniigaId = exports.checkUniqueInternalId = exports.checkBelongsRanch = exports.checkDuplicatedBull = exports.deleteBull = exports.updateBull = exports.createBull = exports.getBull = exports.getBulls = void 0;
const fireorm_1 = require("fireorm");
const utils_1 = require("../utils/utils");
const bull_1 = require("../models/bull");
const firestore_1 = require("firebase-admin/lib/firestore");
const moment = require("moment");
const algolia_1 = require("../utils/algolia");
exports.getBulls = async (req, res) => {
    var _a;
    const repository = fireorm_1.getRepository(bull_1.default);
    const { limit, page, search } = req.query;
    const { ranchId } = req.params;
    try {
        let foundIds = [];
        let foundBulls = [];
        if (search) {
            const hits = await algolia_1.default.search(search, {
                filters: `ranchIdentifier:${ranchId} AND animalType:BULL`,
            });
            if (hits.hits.length > 0) {
                foundIds = hits.hits.map((hit) => {
                    return hit === null || hit === void 0 ? void 0 : hit.internalIdentifier;
                });
            }
            else {
                return res.status(200).json(getBullsResponse([], 0));
            }
        }
        foundBulls = await getAllBulls(ranchId, foundIds);
        let bulls = [];
        if (limit && page) {
            bulls = foundBulls.slice(limit * (page - 1), limit * (page));
        }
        else {
            bulls = foundBulls;
        }
        return res.status(200).json(getBullsResponse(bulls, foundBulls.length));
    }
    catch (error) {
        const constraintError = utils_1.getConstrainsError((_a = error[0]) === null || _a === void 0 ? void 0 : _a.constraints);
        const responseError = constraintError ? constraintError : utils_1.getDefaultError(error);
        return res.status(400).json(responseError);
    }
};
exports.getBull = async (req, res) => {
    const bullRepository = fireorm_1.getRepository(bull_1.default);
    const { ranchId, bullId } = req.params;
    try {
        const bull = await bullRepository
            .whereEqualTo("ranchIdentifier", ranchId)
            .whereEqualTo("id", bullId)
            .findOne();
        if (bull) {
            return res.status(200).json(bull);
        }
        return res.status(404).json({
            code: "not found",
            message: "a bull with this id was not found",
        });
    }
    catch (error) {
        return res.status(400).json(error);
    }
};
exports.createBull = async (req, res) => {
    const repository = fireorm_1.getRepository(bull_1.default);
    const bull = getBullDocument(req.body);
    try {
        const bullCreated = await repository.create(bull);
        return res.status(201).json(bullCreated);
    }
    catch (_) {
        return res.status(200).json({
            code: "creating error",
            message: "an error has occurred while creating the bull",
        });
    }
};
exports.updateBull = async (req, res) => {
    const bullRepository = fireorm_1.getRepository(bull_1.default);
    const { bovineIdentifier, breed, internalIdentifier, siniigaIdentifier, name, birthday, } = req.body;
    try {
        const bull = await bullRepository.findById(bovineIdentifier);
        if (bull) {
            bull.breed = breed;
            bull.internalIdentifier = internalIdentifier;
            bull.siniigaIdentifier = siniigaIdentifier;
            bull.birthday = firestore_1.firestore.Timestamp
                .fromMillis(moment(birthday).valueOf());
            bull.name = name;
            await bullRepository.update(bull);
            return res.status(200).send();
        }
        else {
            return res.status(209).json();
        }
    }
    catch (error) {
        return res.status(209).json(error);
    }
};
exports.deleteBull = async (req, res) => {
    const bullRepository = fireorm_1.getRepository(bull_1.default);
    const { bullId } = req.params;
    try {
        await bullRepository.delete(bullId);
        return res.status(204).send();
    }
    catch (_) {
        return res.status(404).send();
    }
};
exports.checkDuplicatedBull = async (req, res, next) => {
    var _a;
    const bullRepository = fireorm_1.getRepository(bull_1.default);
    const { bovineIdentifier, internalIdentifier, siniigaIdentifier, name, } = req.body;
    try {
        const duplicatedInternalIdentifier = await bullRepository
            .whereEqualTo("internalIdentifier", internalIdentifier).findOne();
        const duplicatedSiniigaIdentifier = await bullRepository
            .whereEqualTo("siniigaIdentifier", siniigaIdentifier).findOne();
        const duplicatedName = await bullRepository
            .whereEqualTo("name", name).findOne();
        if (duplicatedInternalIdentifier && (duplicatedInternalIdentifier === null || duplicatedInternalIdentifier === void 0 ? void 0 : duplicatedInternalIdentifier.id) !== bovineIdentifier) {
            duplicatedResponse(res, "internal identifier");
        }
        else if (duplicatedSiniigaIdentifier && (duplicatedSiniigaIdentifier === null || duplicatedSiniigaIdentifier === void 0 ? void 0 : duplicatedSiniigaIdentifier.id) !== bovineIdentifier) {
            duplicatedResponse(res, "siniiga identifier");
        }
        else if (duplicatedName && (duplicatedName === null || duplicatedName === void 0 ? void 0 : duplicatedName.id) !== bovineIdentifier) {
            duplicatedResponse(res, "name");
        }
        else {
            next();
        }
    }
    catch (error) {
        const constraintError = utils_1.getConstrainsError((_a = error[0]) === null || _a === void 0 ? void 0 : _a.constraints);
        const responseError = constraintError ? constraintError : utils_1.getDefaultError(error);
        return res.status(400).json(responseError);
    }
};
exports.checkBelongsRanch = async (req, res, next) => {
    const bullRepository = fireorm_1.getRepository(bull_1.default);
    const { ranchId } = req.params;
    try {
        const bull = await bullRepository
            .whereEqualTo("ranchIdentifier", ranchId)
            .findOne();
        if (!bull) {
            return res.status(404).send();
        }
        next();
    }
    catch (_) {
        return res.status(404).send();
    }
};
/**
 * Checks if a given internal id was previously registered in a given ranch
 */
exports.checkUniqueInternalId = async (req, res, next) => {
    const repository = fireorm_1.getRepository(bull_1.default);
    const { ranchId, bullId } = req.params;
    const { internalIdentifier } = req.body;
    try {
        const foundBull = await repository
            .whereEqualTo("internalIdentifier", internalIdentifier)
            .whereEqualTo("ranchIdentifier", ranchId).findOne();
        if (foundBull) {
            if (bullId) {
                // updating bull
                if (bullId === foundBull.id) {
                    next();
                }
                else {
                    return res.status(209).json({
                        code: "internal id duplicated",
                        message: "a bull with this internal identifier was saved previously in this ranch",
                    });
                }
            }
            else {
                // new bull
                return res.status(409).json({
                    code: "internal id duplicated",
                    message: "a bull with this internal identifier was saved previously in this ranch",
                });
            }
        }
        else {
            next();
        }
    }
    catch (_) {
        return res.status(200).json({
            code: "checking error",
            message: "an error has occurred while checking the internal identifier",
        });
    }
};
/**
 * Checks if a given internal id was previously registered in the database
 * @param req
 * @param res
 * @param next
 * @return {Promise<*>}
 */
exports.checkUniqueSiniigaId = async (req, res, next) => {
    const repository = fireorm_1.getRepository(bull_1.default);
    const { ranchId, bullId } = req.params;
    const { siniigaIdentifier } = req.body;
    try {
        const foundBull = await repository
            .whereEqualTo("siniigaIdentifier", siniigaIdentifier).findOne();
        if (foundBull) {
            if (bullId) {
                // updating bull
                if (bullId === foundBull.id) {
                    next();
                }
                else {
                    return res.status(209).json({
                        code: "siniiga id duplicated",
                        message: "a bull with this siniiga identifier was saved previously in the database",
                    });
                }
            }
            else {
                // new bull
                return res.status(409).json({
                    code: "siniiga id duplicated",
                    message: "a bull with this siniiga identifier was saved previously in the database",
                });
            }
        }
        else {
            next();
        }
    }
    catch (_) {
        return res.status(200).json({
            code: "checking error",
            message: "an error has occurred while checking the siniiga identifier",
        });
    }
};
/**
 * Checks if a given name was previously registered in a given ranch
 * @param req
 * @param res
 * @param next
 * @return {Promise<*>}
 */
exports.checkUniqueName = async (req, res, next) => {
    const repository = fireorm_1.getRepository(bull_1.default);
    const { ranchId, bullId } = req.params;
    const { name } = req.body;
    try {
        const foundBull = await repository
            .whereEqualTo("ranchIdentifier", ranchId)
            .whereEqualTo("name", name).findOne();
        if (foundBull) {
            if (bullId) {
                // updating bull
                if (bullId === foundBull.id) {
                    next();
                }
                else {
                    return res.status(209).json({
                        code: "name duplicated",
                        message: "a bull with this name was saved previously in this ranch",
                    });
                }
            }
            else {
                // new bull
                return res.status(409).json({
                    code: "name duplicated",
                    message: "a bull with this name was saved previously in the database",
                });
            }
        }
        else {
            next();
        }
    }
    catch (_) {
        return res.status(200).json({
            code: "checking error",
            message: "an error has occurred while checking the siniiga identifier",
        });
    }
};
function getBullsResponse(bulls, count) {
    return {
        bulls,
        count,
    };
}
/**
 * Gets an bull collection from a request body
 * @param body a request body
 * @return {Bull}
 */
function getBullDocument(body) {
    const bull = new bull_1.default();
    bull.name = body.name;
    bull.breed = body.breed;
    bull.internalIdentifier = body.internalIdentifier;
    bull.ranchIdentifier = body.ranchIdentifier;
    bull.birthday = firestore_1.firestore.Timestamp
        .fromMillis(moment(body.birthday).valueOf());
    bull.siniigaIdentifier = body.siniigaIdentifier;
    bull.groupIdentifier = body.groupIdentifier;
    bull.deleteAt = null;
    return bull;
}
function duplicatedResponse(res, duplicatedItem) {
    return res.status(404).json({
        code: "duplicated",
        message: `a bull with this ${duplicatedItem} was found`,
    });
}
async function getAllBulls(ranchId, foundIds) {
    const repository = fireorm_1.getRepository(bull_1.default);
    const query = repository
        .whereEqualTo("ranchIdentifier", ranchId)
        .whereEqualTo("deleteAt", null);
    return foundIds.length > 0 ? await query.whereIn("internalIdentifier", foundIds).find() : await query.find();
}
//# sourceMappingURL=bull.controller.js.map