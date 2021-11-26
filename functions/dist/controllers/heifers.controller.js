"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHeifers = void 0;
const fireorm_1 = require("fireorm");
const femaleBovine_1 = require("../models/femaleBovine");
const utils_1 = require("../utils/utils");
const algolia_1 = require("../utils/algolia");
exports.getHeifers = async (req, res) => {
    var _a;
    const repository = fireorm_1.getRepository(femaleBovine_1.default);
    const { limit, page, filter, values, search } = req.query;
    const { ranchId } = req.params;
    try {
        let foundHeifers = [];
        let foundIds = [];
        if (search) {
            const hits = await algolia_1.default.search(search, {
                filters: `ranchIdentifier:${ranchId} AND animalType:HEIFER`,
            });
            if (hits.hits.length > 0) {
                foundIds = hits.hits.map((hit) => {
                    return hit === null || hit === void 0 ? void 0 : hit.internalIdentifier;
                });
            }
            else {
                return res.status(200).json(getHeifersResponse([], 0));
            }
        }
        if (filter && values) {
            foundHeifers = await getFilteredHeifers(req);
            foundHeifers = search ? foundHeifers.filter((heifer) => foundIds.includes(heifer.internalIdentifier)) : foundHeifers;
        }
        else {
            foundHeifers = await getAllHeifers(ranchId, foundIds);
        }
        let cows = [];
        if (limit && page) {
            cows = foundHeifers.slice(limit * (page - 1), limit * (page));
        }
        else {
            cows = foundHeifers;
        }
        return res.status(200).json(getHeifersResponse(cows, foundHeifers.length));
    }
    catch (error) {
        const constraintError = utils_1.getConstrainsError((_a = error[0]) === null || _a === void 0 ? void 0 : _a.constraints);
        const responseError = constraintError ? constraintError : utils_1.getDefaultError(error);
        return res.status(400).json(responseError);
    }
};
async function getFilteredHeifers(req) {
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
                .whereEqualTo("lactationCycle", 0)
                .whereIn("breed", filterValues).find();
        case "DELETED":
            if (filterValues.includes("DEAD") && filterValues.includes("SOLD")) {
                const isDeadQuery = repository
                    .whereEqualTo("ranchIdentifier", ranchId)
                    .whereEqualTo("lactationCycle", 0)
                    .whereEqualTo("isDead", true);
                const deleteAtQuery = repository
                    .whereEqualTo("ranchIdentifier", ranchId)
                    .whereEqualTo("lactationCycle", 0)
                    .whereNotEqualTo("deleteAt", null);
                const promises = [isDeadQuery.find(), deleteAtQuery.find()];
                const responses = await Promise.all(promises);
                return responses.flat();
            }
            else if (filterValues.includes("DEAD")) {
                return await repository
                    .whereEqualTo("ranchIdentifier", ranchId)
                    .whereEqualTo("lactationCycle", 0)
                    .whereEqualTo("isDead", true)
                    .find();
            }
            else if (filterValues.includes("SOLD")) {
                return await repository
                    .whereEqualTo("ranchIdentifier", ranchId)
                    .whereEqualTo("lactationCycle", 0)
                    .whereNotEqualTo("deleteAt", null)
                    .find();
            }
            break;
        default:
            return [];
    }
}
async function getAllHeifers(ranchId, foundIds) {
    const repository = fireorm_1.getRepository(femaleBovine_1.default);
    const query = repository
        .whereEqualTo("ranchIdentifier", ranchId)
        .whereEqualTo("deleteAt", null)
        .whereEqualTo("isDead", false)
        .whereEqualTo("lactationCycle", 0);
    return foundIds.length > 0 ? await query.whereIn("internalIdentifier", foundIds).find() : await query.find();
}
function getHeifersResponse(femaleBovines, count) {
    return {
        femaleBovines,
        count,
    };
}
//# sourceMappingURL=heifers.controller.js.map