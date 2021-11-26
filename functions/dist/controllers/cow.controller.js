"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkBelongsRanch = exports.getCows = void 0;
const utils_1 = require("../utils/utils");
const fireorm_1 = require("fireorm");
const femaleBovine_1 = require("../models/femaleBovine");
const algolia_1 = require("../utils/algolia");
exports.getCows = async (req, res) => {
    var _a;
    const repository = fireorm_1.getRepository(femaleBovine_1.default);
    const { limit, page, filter, values, search } = req.query;
    const { ranchId } = req.params;
    if (filter === "PREGNANT") {
        await getDashboardCows(req, res);
    }
    try {
        let foundCows = [];
        let foundIds = [];
        if (search) {
            const hits = await algolia_1.default.search(search, {
                filters: `ranchIdentifier:${ranchId} AND animalType:COW`,
            });
            if (hits.hits.length > 0) {
                foundIds = hits.hits.map((hit) => {
                    return hit === null || hit === void 0 ? void 0 : hit.internalIdentifier;
                });
            }
            else {
                return res.status(200).json(utils_1.getCowsResponse([], 0));
            }
        }
        if (filter && values) {
            foundCows = await getFilteredCows(req);
            foundCows = search ? foundCows.filter((cow) => foundIds.includes(cow.internalIdentifier)) : foundCows;
        }
        else {
            foundCows = await getAllCows(ranchId, foundIds);
        }
        let cows = [];
        let cowsWithLastCalving = [];
        let cowsWithLastPregnant = [];
        if (limit && page) {
            cows = foundCows.slice(limit * (page - 1), limit * (page));
        }
        else {
            cows = foundCows;
        }
        cowsWithLastCalving = await utils_1.getLastCalvingEvents(cows, filter);
        cowsWithLastPregnant = await utils_1.getLastPregnantEvents(cowsWithLastCalving);
        return res.status(200).json(utils_1.getCowsResponse(cowsWithLastPregnant, foundCows.length));
    }
    catch (error) {
        const constraintError = utils_1.getConstrainsError((_a = error[0]) === null || _a === void 0 ? void 0 : _a.constraints);
        const responseError = constraintError ? constraintError : utils_1.getDefaultError(error);
        return res.status(400).json(responseError);
    }
};
async function getDashboardCows(req, res) {
    const { limit, page, filter, values, search } = req.query;
    const { ranchId } = req.params;
    try {
        let foundCows = [];
        let slicedCows = [];
        foundCows = await getAllCows(ranchId, []);
        if (filter === "PREGNANT") {
            const cowsWithLastPregnantEvent = await utils_1.getLastPregnantEvents(foundCows);
            foundCows = cowsWithLastPregnantEvent.filter((cow) => cow.lastPregnantDate);
        }
        slicedCows = limit && page ? foundCows.slice(limit * (page - 1), limit * (page)) : foundCows;
        return res.status(200).json(utils_1.getCowsResponse(slicedCows, foundCows.length));
    }
    catch (e) {
        return res.status(400).json(e);
    }
}
/**
 * A middleware that checks if a given animal belongs to a ranch
 * @param req a request object
 * @param res a response object
 * @param next
 * @return {Promise<*>}
 */
exports.checkBelongsRanch = async (req, res, next) => {
    const repository = fireorm_1.getRepository(femaleBovine_1.default);
    const { ranchId } = req.params;
    try {
        const cow = await repository
            .whereEqualTo("ranchIdentifier", ranchId)
            .findOne();
        if (!cow) {
            return res.status(404).send();
        }
        next();
    }
    catch (_) {
        return res.status(404).send();
    }
};
/**
 * Gets a filtered array of FemaleBovines from a given ranch identifier
 * @param req a request object
 * @returns {Promise<FemaleBovine[]|*[]|FlatArray<FemaleBovine[][], 1>[]>}
 */
async function getFilteredCows(req) {
    const repository = fireorm_1.getRepository(femaleBovine_1.default);
    const { limit, page, filter, values } = req.query;
    const { ranchId } = req.params;
    const filterValues = values.split(",");
    switch (filter) {
        case "BREED":
            return await repository
                .whereEqualTo("ranchIdentifier", ranchId)
                .whereEqualTo("isDead", false)
                .whereEqualTo("deleteAt", null)
                .whereNotEqualTo("lactationCycle", 0)
                .whereIn("breed", filterValues).find();
        case "HEAT":
            return await repository
                .whereEqualTo("ranchIdentifier", ranchId)
                .whereEqualTo("isDead", false)
                .whereEqualTo("deleteAt", null)
                .whereEqualTo("heatStatus", "PENDING")
                .whereNotEqualTo("lactationCycle", 0).find();
        case "DELETED":
            if (filterValues.includes("DEAD") && filterValues.includes("SOLD")) {
                const isDeadQuery = repository
                    .whereEqualTo("ranchIdentifier", ranchId)
                    .whereNotEqualTo("lactationCycle", 0)
                    .whereEqualTo("isDead", true);
                const deleteAtQuery = repository
                    .whereEqualTo("ranchIdentifier", ranchId)
                    .whereNotEqualTo("deleteAt", null);
                const promises = [isDeadQuery.find(), deleteAtQuery.find()];
                const responses = await Promise.all(promises);
                return getOnlyCows(responses.flat());
            }
            else if (filterValues.includes("DEAD")) {
                return await repository
                    .whereEqualTo("ranchIdentifier", ranchId)
                    .whereNotEqualTo("lactationCycle", 0)
                    .whereEqualTo("isDead", true)
                    .find();
            }
            else if (filterValues.includes("SOLD")) {
                const response = await repository
                    .whereEqualTo("ranchIdentifier", ranchId)
                    .whereNotEqualTo("deleteAt", null)
                    .find();
                return getOnlyCows(response);
            }
            break;
        default:
            return [];
    }
}
/**
 * Gets all the cows with a given ranch identifier
 * @param ranchId a given ranch identifier
 * @param foundIds an array of internals ids found by algolia
 * @return {Promise<FemaleBovine[]>}
 */
async function getAllCows(ranchId, foundIds) {
    const repository = fireorm_1.getRepository(femaleBovine_1.default);
    const query = repository.whereEqualTo("ranchIdentifier", ranchId)
        .whereEqualTo("deleteAt", null)
        .whereEqualTo("isDead", false)
        .whereGreaterThan("lactationCycle", 0);
    return foundIds.length > 0 ? await query.whereIn("internalIdentifier", foundIds).find() : await query.find();
}
function getOnlyCows(cows) {
    return cows.map((cow) => {
        if (cow.lactationCycle > 0) {
            return cow;
        }
    });
}
//# sourceMappingURL=cow.controller.js.map