"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRanch = exports.deleteRanch = exports.getRanch = exports.getRanches = exports.createRanch = void 0;
const ranch_1 = require("../models/ranch");
const fireorm_1 = require("fireorm");
const utils_1 = require("../utils/utils");
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
exports.createRanch = async (req, res) => {
    const ranchRepository = fireorm_1.getRepository(ranch_1.default);
    const role = res.locals.role;
    if (!["admin"].includes(role)) {
        return res.status(401)
            .json({ message: "Unauthorized to create a ranch",
            code: "role/unauthorized" });
    }
    try {
        const { name, position, address, } = req.body;
        const newRanch = new ranch_1.default();
        newRanch.name = name;
        newRanch.position = position;
        newRanch.address = address;
        newRanch.createDate = new Date();
        newRanch.userIdentifier = res.locals.uid;
        await ranchRepository.create(newRanch);
        return res.status(201).json({
            message: "A ranch was created",
        });
    }
    catch (error) {
        const constraintError = utils_1.getConstrainsError(error[0].constraints);
        const responseError = constraintError ? constraintError : utils_1.getDefaultError();
        return res.status(400).json(responseError);
    }
};
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
exports.getRanches = async (req, res) => {
    const ranchRepository = fireorm_1.getRepository(ranch_1.default);
    const limit = req.query.limit;
    const page = req.query.page;
    const uid = res.locals.uid;
    try {
        const response = {
            ranches: [],
            count: 0,
        };
        const ranches = await ranchRepository
            .whereEqualTo("userIdentifier", uid).find();
        response.ranches = limit && page ? ranches.slice(limit * (page - 1), limit * (page)) : ranches;
        response.count = ranches.length;
        return res.status(200).json(response);
    }
    catch (e) {
        return res.status(400).send({ message: "Unexpected error" });
    }
};
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
exports.getRanch = async (req, res) => {
    const ranchRepository = fireorm_1.getRepository(ranch_1.default);
    const ranchId = req.params.id;
    const role = res.locals.role;
    if (!["admin"].includes(role)) {
        return res.status(401)
            .json({ message: "Unauthorized to get a ranch",
            code: "role/unauthorized" });
    }
    try {
        const ranch = await ranchRepository.whereEqualTo("id", ranchId).findOne();
        return res.status(200).json(ranch);
    }
    catch (e) {
        console.log(e);
        return res.status(400).json({ message: e.message });
    }
};
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
exports.deleteRanch = async (req, res) => {
    const ranchRepository = fireorm_1.getRepository(ranch_1.default);
    const ranchId = req.params.id;
    const role = res.locals.role;
    if (!["admin"].includes(role)) {
        return res.status(401)
            .json({ message: "Unauthorized to delete a ranch",
            code: "role/unauthorized" });
    }
    try {
        await ranchRepository.delete(ranchId);
        return res.status(200).send();
    }
    catch (e) {
        return res.status(400).json({ message: e.message });
    }
};
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
exports.updateRanch = async (req, res) => {
    const ranchRepository = fireorm_1.getRepository(ranch_1.default);
    const ranchId = req.params.id;
    const role = res.locals.role;
    if (!["admin"].includes(role)) {
        return res.status(401).json({ message: "Unauthorized to update a ranch",
            code: "role/unauthorized",
        });
    }
    try {
        const { name, position, address, } = req.body;
        const ranch = await ranchRepository.findById(ranchId);
        ranch.name = name;
        ranch.position = position;
        ranch.address = address;
        await ranchRepository.update(ranch);
        return res.status(200).send();
    }
    catch (e) {
        return res.status(400).json({ message: e.message });
    }
};
//# sourceMappingURL=ranch.controller.js.map