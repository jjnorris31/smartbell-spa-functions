"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefaultGroup = exports.checkUniqueGroupName = exports.updateGroup = exports.createGroup = exports.deleteGroup = exports.getGroups = exports.getGroup = void 0;
const algolia_1 = require("../utils/algolia");
const utils_1 = require("../utils/utils");
const fireorm_1 = require("fireorm");
const group_1 = require("../models/group");
const femaleBovine_1 = require("../models/femaleBovine");
const moment = require("moment");
exports.getGroup = async (req, res) => {
    const { limit, page, filter, values, search, type } = req.query;
    console.log({ filter });
    const { ranchId, id } = req.params;
    try {
        let foundFemaleBovines = [];
        let foundIds = [];
        const group = await getGroupByIdentifier(req);
        if (search) {
            const hits = await algolia_1.default.search(search, {
                filters: `groupIdentifier:${id} AND animalType:${type}`,
            });
            if (hits.hits.length > 0) {
                foundIds = hits.hits.map((hit) => {
                    return hit === null || hit === void 0 ? void 0 : hit.internalIdentifier;
                });
            }
            else {
                return res.status(200).json(Object.assign(Object.assign({}, group), utils_1.getCowsResponse([], 0)));
            }
        }
        if (filter && values) {
            if (type === "COW") {
                foundFemaleBovines = await getFilteredCowsByGroup(req);
            }
            else if (type === "HEIFER") {
                foundFemaleBovines = await getFilteredHeifersByGroup(req);
            }
            foundFemaleBovines = search ? foundFemaleBovines.filter((femaleBovine) => foundIds.includes(femaleBovine.internalIdentifier)) : foundFemaleBovines;
        }
        else {
            if (type === "COW") {
                foundFemaleBovines = await getCowsByGroup(ranchId, foundIds, id);
            }
            else if (type === "HEIFER") {
                foundFemaleBovines = await getHeifersByGroup(ranchId, foundIds, id);
                console.log({ foundFemaleBovines });
            }
        }
        let cows = [];
        let cowsWithLastCalving = [];
        let cowsWithLastPregnant = [];
        if (limit && page) {
            cows = foundFemaleBovines.slice(limit * (page - 1), limit * (page));
        }
        else {
            cows = foundFemaleBovines;
        }
        if (type === "COW") {
            cowsWithLastCalving = await utils_1.getLastCalvingEvents(cows);
            cowsWithLastPregnant = await utils_1.getLastPregnantEvents(cowsWithLastCalving);
            const groupResponse = Object.assign(Object.assign({}, group), utils_1.getCowsResponse(cowsWithLastPregnant, cows.length));
            return res.status(200).json(Object.assign(Object.assign({}, group), utils_1.getCowsResponse(cowsWithLastPregnant, cows.length)));
        }
        else if (type === "HEIFER") {
            return res.status(200).json(Object.assign(Object.assign({}, group), utils_1.getCowsResponse(cows, cows.length)));
        }
        return res.status(200).json({ group: {}, femaleBovines: [], count: 0 });
    }
    catch (error) {
        return res.status(400).json(error);
    }
};
exports.getGroups = async (req, res) => {
    const { ranchId } = req.params;
    const { type } = req.query;
    const repository = fireorm_1.getRepository(group_1.default);
    try {
        const groupIdentifiers = [...utils_1.DEFAULT_GROUPS, ranchId];
        const groupsWithoutCount = await repository
            .whereIn("ranchIdentifier", groupIdentifiers)
            .whereEqualTo("type", type)
            .find();
        const groupCountPromises = [];
        if (type === "COW") {
            for (const group of groupsWithoutCount) {
                groupCountPromises.push(getCowsByGroup(ranchId, [], group.id));
            }
        }
        else if (type === "HEIFER") {
            for (const group of groupsWithoutCount) {
                groupCountPromises.push(getHeifersByGroup(ranchId, [], group.id));
            }
        }
        for (const group of groupsWithoutCount) {
            groupCountPromises.push(getCowsByGroup(ranchId, [], group.id));
        }
        const groupCountResponses = await Promise.all(groupCountPromises);
        console.log({ groupCountResponses });
        const groups = [];
        groupsWithoutCount.forEach((group, index) => {
            groups.push(Object.assign(Object.assign({}, group), { count: groupCountResponses[index].length }));
        });
        return res.status(200).json(groups);
    }
    catch (error) {
        return res.status(400).json(error);
    }
};
exports.deleteGroup = async (req, res) => {
    const { ranchId, id } = req.params;
    if (utils_1.DEFAULT_GROUPS.includes(id)) {
        return res.status(403).json({
            code: "delete default",
            message: "Cannot delete a default group",
        });
    }
    try {
        await fireorm_1.runTransaction(async (tran) => {
            const groupTranRepository = tran.getRepository(group_1.default);
            const femaleBovineTranRepository = tran.getRepository(femaleBovine_1.default);
            const femaleBovinesQuery = femaleBovineTranRepository
                .whereEqualTo("ranchIdentifier", ranchId)
                .whereEqualTo("deleteAt", null)
                .whereEqualTo("isDead", false)
                .whereEqualTo("groupIdentifier", id)
                .whereGreaterThan("lactationCycle", 0);
            const femaleBovines = await femaleBovinesQuery.find();
            await groupTranRepository.delete(id);
            for (const femaleBovine of femaleBovines) {
                femaleBovine.groupIdentifier = "DEFAULT";
                await femaleBovineTranRepository.update(femaleBovine);
            }
        });
        return res.status(204).json({});
    }
    catch (error) {
        return res.status(404).json(error);
    }
};
exports.createGroup = async (req, res) => {
    const { description, KPI, name, animals, type, } = req.body;
    const { ranchId } = req.params;
    try {
        const group = new group_1.default();
        group.description = description;
        group.createdAt = utils_1.getTimestampByDate();
        group.name = name;
        group.type = type;
        group.KPI = KPI;
        group.ranchIdentifier = ranchId;
        let createdGroup = null;
        await fireorm_1.runTransaction(async (tran) => {
            const femaleBovineTransactionRepository = tran.getRepository(femaleBovine_1.default);
            const groupTransactionRepository = tran.getRepository(group_1.default);
            const femaleBovinesToUpdate = [];
            for (const id of animals) {
                // todo change to promise all
                const femaleBovine = await femaleBovineTransactionRepository.findById(id);
                femaleBovinesToUpdate.push(femaleBovine);
            }
            createdGroup = await groupTransactionRepository.create(group);
            for (const femaleBovine of femaleBovinesToUpdate) {
                femaleBovine.groupIdentifier = createdGroup.id;
                await femaleBovineTransactionRepository.update(femaleBovine);
            }
        });
        return res.status(200).json(createdGroup);
    }
    catch (e) {
        return res.status(400).json(e);
    }
};
exports.updateGroup = async (req, res) => {
    const { ranchId, id } = req.params;
    const { description, } = req.body;
    const repository = fireorm_1.getRepository(group_1.default);
    try {
        const group = await repository.findById(id);
        group.description = description;
        await repository.update(group);
        return res.status(200).json({});
    }
    catch (e) {
        return res.status(209).json(e);
    }
};
exports.checkUniqueGroupName = async (req, res, next) => {
    const { ranchId } = req.params;
    const { name } = req.body;
    const repository = fireorm_1.getRepository(group_1.default);
    try {
        const foundGroup = await repository
            .whereEqualTo("name", name)
            .whereEqualTo("ranchIdentifier", ranchId).findOne();
        if (foundGroup) {
            return res.status(209).json({
                code: "name duplicated",
                message: "a group with this name was saved previously in this ranch",
            });
        }
        else {
            next();
        }
    }
    catch (e) {
        return res.status(200).json({
            code: "checking error",
            message: "an error has occurred while checking the group's name",
        });
    }
};
exports.createDefaultGroup = async (req, res) => {
    const repository = fireorm_1.getRepository(group_1.default);
    try {
        await repository.create({
            createdAt: utils_1.getTimestampByDate(),
            description: "DEFAULT",
            KPI: "HEAT",
            name: "DEFAULT",
            id: "DEFAULT",
            ranchIdentifier: "DEFAULT",
            type: "COW",
        });
        return res.status(201).json();
    }
    catch (e) {
        return res.status(400).json(e);
    }
};
async function getGroupByIdentifier(req) {
    const repository = fireorm_1.getRepository(group_1.default);
    const { ranchId, id } = req.params;
    return await repository
        .whereEqualTo("id", id).findOne();
}
async function getFilteredCowsByGroup(req) {
    const repository = fireorm_1.getRepository(femaleBovine_1.default);
    const { limit, page, filter, values } = req.query;
    const { ranchId, id } = req.params;
    let filterValues = values.split(",");
    switch (filter) {
        case "LACTATION":
            filterValues = getIntegerFilterValues(filterValues);
            return await repository
                .whereEqualTo("ranchIdentifier", ranchId)
                .whereEqualTo("isDead", false)
                .whereEqualTo("deleteAt", null)
                .whereEqualTo("groupIdentifier", id)
                .whereIn("lactationCycle", filterValues).find();
        case "BREED":
            return await repository
                .whereEqualTo("ranchIdentifier", ranchId)
                .whereEqualTo("isDead", false)
                .whereEqualTo("deleteAt", null)
                .whereEqualTo("groupIdentifier", id)
                .whereNotEqualTo("lactationCycle", 0)
                .whereIn("breed", filterValues).find();
        case "AGE":
            filterValues = getIntegerFilterValues(filterValues);
            const foundCows = await repository
                .whereEqualTo("ranchIdentifier", ranchId)
                .whereEqualTo("isDead", false)
                .whereEqualTo("deleteAt", null)
                .whereEqualTo("groupIdentifier", id)
                .whereNotEqualTo("lactationCycle", 0).find();
            return foundCows.filter((cow) => {
                const age = moment().diff(moment(cow.birthday), "years");
                return filterValues.includes(age);
            });
        default:
            return [];
    }
}
/**
 * Gets a filtered array of FemaleBovines from a given ranch identifier
 * @param req a request object
 * @returns {Promise<FemaleBovine[]|*[]|FlatArray<FemaleBovine[][], 1>[]>}
 */
async function getFilteredHeifersByGroup(req) {
    const repository = fireorm_1.getRepository(femaleBovine_1.default);
    const { limit, page, filter, values } = req.query;
    const { ranchId, id } = req.params;
    const filterValues = values.split(",");
    switch (filter) {
        case "BREED":
            return await repository
                .whereEqualTo("ranchIdentifier", ranchId)
                .whereEqualTo("isDead", false)
                .whereEqualTo("deleteAt", null)
                .whereEqualTo("lactationCycle", 0)
                .whereEqualTo("groupIdentifier", id)
                .whereIn("breed", filterValues).find();
        case "DELETED":
            if (filterValues.includes("DEAD") && filterValues.includes("SOLD")) {
                const isDeadQuery = repository
                    .whereEqualTo("ranchIdentifier", ranchId)
                    .whereEqualTo("lactationCycle", 0)
                    .whereEqualTo("groupIdentifier", id)
                    .whereEqualTo("isDead", true);
                const deleteAtQuery = repository
                    .whereEqualTo("ranchIdentifier", ranchId)
                    .whereEqualTo("lactationCycle", 0)
                    .whereEqualTo("groupIdentifier", id)
                    .whereNotEqualTo("deleteAt", null);
                const promises = [isDeadQuery.find(), deleteAtQuery.find()];
                const responses = await Promise.all(promises);
                return responses.flat();
            }
            else if (filterValues.includes("DEAD")) {
                return await repository
                    .whereEqualTo("ranchIdentifier", ranchId)
                    .whereEqualTo("lactationCycle", 0)
                    .whereEqualTo("groupIdentifier", id)
                    .whereEqualTo("isDead", true)
                    .find();
            }
            else if (filterValues.includes("SOLD")) {
                return await repository
                    .whereEqualTo("ranchIdentifier", ranchId)
                    .whereEqualTo("lactationCycle", 0)
                    .whereEqualTo("groupIdentifier", id)
                    .whereNotEqualTo("deleteAt", null)
                    .find();
            }
            break;
        default:
            return [];
    }
}
function getIntegerFilterValues(filterValues) {
    return filterValues = filterValues.map((value) => {
        return parseInt(value);
    });
}
async function getCowsByGroup(ranchId, foundIds, id) {
    const repository = fireorm_1.getRepository(femaleBovine_1.default);
    console.log({ ranchId });
    console.log({ foundIds });
    console.log({ id });
    const query = repository
        .whereEqualTo("ranchIdentifier", ranchId)
        .whereEqualTo("deleteAt", null)
        .whereEqualTo("isDead", false)
        .whereEqualTo("groupIdentifier", id)
        .whereGreaterThan("lactationCycle", 0);
    console.log(await query.find());
    return foundIds.length > 0 ? await query
        .whereIn("internalIdentifier", foundIds).find() : await query.find();
}
async function getHeifersByGroup(ranchId, foundIds, id) {
    const repository = fireorm_1.getRepository(femaleBovine_1.default);
    const query = repository
        .whereEqualTo("ranchIdentifier", ranchId)
        .whereEqualTo("deleteAt", null)
        .whereEqualTo("isDead", false)
        .whereEqualTo("groupIdentifier", id)
        .whereEqualTo("lactationCycle", 0);
    return foundIds.length > 0 ? await query.whereIn("internalIdentifier", foundIds).find() : await query.find();
}
//# sourceMappingURL=group.controller.js.map