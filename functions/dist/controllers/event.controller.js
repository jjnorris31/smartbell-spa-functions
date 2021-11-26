"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateHeatStatus = exports.checkAnimalExist = exports.getPregnantEventsByLactationCycle = exports.getCalvingEvents = exports.getPregnantEvents = exports.getHeatEvents = exports.getHeatEventsByLactationCycle = exports.getLastCalvingEvent = exports.createPregnantEvent = exports.createCalvingEvent = exports.createHeatEvent = void 0;
const heatEvent_1 = require("../models/events/heatEvent");
const fireorm_1 = require("fireorm");
const firestore_1 = require("firebase-admin/lib/firestore");
const moment = require("moment");
const utils_1 = require("../utils/utils");
const calvingEvent_1 = require("../models/events/calvingEvent");
const pregnantEvent_1 = require("../models/events/pregnantEvent");
const femaleBovine_1 = require("../models/femaleBovine");
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
exports.createHeatEvent = async (req, res) => {
    var _a;
    const femaleBovineRepository = fireorm_1.getRepository(femaleBovine_1.default);
    try {
        const { date, description, bovineIdentifier, type, bullIdentifier, lactationCycle, } = req.body;
        const femaleBovineRef = await femaleBovineRepository
            .findById(bovineIdentifier);
        const newHeatEvent = new heatEvent_1.default();
        newHeatEvent.date = getTimestampByDate(date);
        newHeatEvent.description = description;
        newHeatEvent.type = type;
        newHeatEvent.bovineIdentifier = bovineIdentifier;
        newHeatEvent.bullIdentifier = bullIdentifier;
        newHeatEvent.lactationCycle = parseInt(lactationCycle);
        await femaleBovineRef.heatEvents.create(newHeatEvent);
        return res.status(201).json({
            message: "a heat event was created",
        });
    }
    catch (error) {
        const constraintError = utils_1.getConstrainsError((_a = error[0]) === null || _a === void 0 ? void 0 : _a.constraints);
        const responseError = constraintError ? constraintError : utils_1.getDefaultError(error);
        return res.status(400).json(responseError);
    }
};
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
exports.createCalvingEvent = async (req, res) => {
    var _a;
    const femaleBovineRepository = fireorm_1.getRepository(femaleBovine_1.default);
    try {
        const { bovineIdentifier, date, description, type, abortReason, sickness, lactationCycle, } = req.body;
        const femaleBovineRef = await femaleBovineRepository
            .findById(bovineIdentifier);
        if (!femaleBovineRef) {
            return res.status(404).json({
                code: "not found",
                // eslint-disable-next-line max-len
                message: "animal not found",
            });
        }
        const newCalvingEvent = new calvingEvent_1.default();
        newCalvingEvent.date = getTimestampByDate(date);
        newCalvingEvent.description = description;
        newCalvingEvent.type = type;
        newCalvingEvent.abortReason = abortReason;
        newCalvingEvent.sickness = sickness;
        newCalvingEvent.lactationCycle = parseInt(lactationCycle);
        await femaleBovineRef.calvingEvents.create(newCalvingEvent);
        return res.status(201).json({
            message: "a calving event was created",
        });
    }
    catch (error) {
        console.log({ error });
        const constraintError = utils_1.getConstrainsError((_a = error[0]) === null || _a === void 0 ? void 0 : _a.constraints);
        const responseError = constraintError ? constraintError : utils_1.getDefaultError(error);
        return res.status(400).json(responseError);
    }
};
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
exports.createPregnantEvent = async (req, res) => {
    var _a;
    const femaleBovineRepository = fireorm_1.getRepository(femaleBovine_1.default);
    try {
        const { bovineIdentifier, date, description, type, heatIdentifier, lactationCycle, } = req.body;
        const femaleBovineRef = await femaleBovineRepository
            .findById(bovineIdentifier);
        if (heatIdentifier) {
            const pregnantEvent = await femaleBovineRef.pregnantEvents
                .whereEqualTo("heatIdentifier", heatIdentifier).findOne();
            if (pregnantEvent) {
                return res.status(400).json({
                    code: "duplicated heat",
                    message: "the heat provided was previously registered",
                });
            }
        }
        const newPregnantEvent = new pregnantEvent_1.default();
        newPregnantEvent.date = getTimestampByDate(date);
        newPregnantEvent.description = description;
        newPregnantEvent.type = type;
        newPregnantEvent.heatIdentifier = heatIdentifier;
        newPregnantEvent.lactationCycle = parseInt(lactationCycle);
        newPregnantEvent.bovineIdentifier = bovineIdentifier;
        await femaleBovineRef.pregnantEvents.create(newPregnantEvent);
        return res.status(201).json({
            message: "a pregnant event was created",
        });
    }
    catch (error) {
        const constraintError = utils_1.getConstrainsError((_a = error[0]) === null || _a === void 0 ? void 0 : _a.constraints);
        const responseError = constraintError ? constraintError : utils_1.getDefaultError(error);
        return res.status(400).json(responseError);
    }
};
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
exports.getLastCalvingEvent = async (req, res) => {
    var _a;
    const femaleBovineRepository = fireorm_1.getRepository(femaleBovine_1.default);
    console.log(req.query);
    const bovineIdentifier = req.query.bovine;
    const lactationCycle = parseInt(req.query.cycle);
    try {
        const femaleBovineRef = await femaleBovineRepository
            .findById(bovineIdentifier);
        const lastCalvingEvent = await femaleBovineRef.calvingEvents
            .whereEqualTo("lactationCycle", lactationCycle)
            .whereEqualTo("abortReason", null).findOne();
        return res.status(200).json(lastCalvingEvent);
    }
    catch (error) {
        console.log({ error });
        const constraintError = utils_1.getConstrainsError((_a = error[0]) === null || _a === void 0 ? void 0 : _a.constraints);
        const responseError = constraintError ? constraintError : utils_1.getDefaultError(error);
        return res.status(400).json(responseError);
    }
};
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
exports.getHeatEventsByLactationCycle = async (req, res) => {
    var _a;
    const femaleBovineRepository = fireorm_1.getRepository(femaleBovine_1.default);
    const bovineIdentifier = req.query.bovine;
    const lactationCycle = parseInt(req.query.cycle);
    try {
        const femaleBovineRef = await femaleBovineRepository
            .findById(bovineIdentifier);
        const lastCalvingEvent = await femaleBovineRef.heatEvents
            .whereEqualTo("lactationCycle", lactationCycle).find();
        if (lastCalvingEvent) {
            return res.status(200).json(lastCalvingEvent);
        }
        else {
            return res.status(404).json({
                code: "not found",
                // eslint-disable-next-line max-len
                message: "any event was found with the data provided",
            });
        }
    }
    catch (error) {
        const constraintError = utils_1.getConstrainsError((_a = error[0]) === null || _a === void 0 ? void 0 : _a.constraints);
        const responseError = constraintError ? constraintError : utils_1.getDefaultError(error);
        return res.status(400).json(responseError);
    }
};
exports.getHeatEvents = async (req, res) => {
    var _a;
    const femaleBovineRepository = fireorm_1.getRepository(femaleBovine_1.default);
    const bovineIdentifier = req.query.bovine;
    try {
        const femaleBovineRef = await femaleBovineRepository
            .findById(bovineIdentifier);
        const heatEvents = await femaleBovineRef.heatEvents
            .whereNotEqualTo("lactationCycle", femaleBovineRef.lactationCycle).find();
        return res.status(200).json(heatEvents);
    }
    catch (error) {
        const constraintError = utils_1.getConstrainsError((_a = error[0]) === null || _a === void 0 ? void 0 : _a.constraints);
        const responseError = constraintError ? constraintError : utils_1.getDefaultError(error);
        return res.status(400).json(responseError);
    }
};
exports.getPregnantEvents = async (req, res) => {
    var _a;
    const femaleBovineRepository = fireorm_1.getRepository(femaleBovine_1.default);
    const bovineIdentifier = req.query.bovine;
    try {
        const femaleBovineRef = await femaleBovineRepository
            .findById(bovineIdentifier);
        const pregnantEvents = await femaleBovineRef.pregnantEvents
            .whereNotEqualTo("lactationCycle", femaleBovineRef.lactationCycle).find();
        return res.status(200).json(pregnantEvents);
    }
    catch (error) {
        const constraintError = utils_1.getConstrainsError((_a = error[0]) === null || _a === void 0 ? void 0 : _a.constraints);
        const responseError = constraintError ? constraintError : utils_1.getDefaultError(error);
        return res.status(400).json(responseError);
    }
};
exports.getCalvingEvents = async (req, res) => {
    var _a;
    const femaleBovineRepository = fireorm_1.getRepository(femaleBovine_1.default);
    const bovineIdentifier = req.query.bovine;
    try {
        const femaleBovineRef = await femaleBovineRepository
            .findById(bovineIdentifier);
        const calvingEvents = await femaleBovineRef.calvingEvents
            .whereNotEqualTo("lactationCycle", femaleBovineRef.lactationCycle).find();
        return res.status(200).json(calvingEvents);
    }
    catch (error) {
        const constraintError = utils_1.getConstrainsError((_a = error[0]) === null || _a === void 0 ? void 0 : _a.constraints);
        const responseError = constraintError ? constraintError : utils_1.getDefaultError(error);
        return res.status(400).json(responseError);
    }
};
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
exports.getPregnantEventsByLactationCycle = async (req, res) => {
    var _a;
    const femaleBovineRepository = fireorm_1.getRepository(femaleBovine_1.default);
    const bovineIdentifier = req.query.bovine;
    const lactationCycle = parseInt(req.query.cycle);
    try {
        const femaleBovineRef = await femaleBovineRepository
            .findById(bovineIdentifier);
        const lastCalvingEvent = await femaleBovineRef.pregnantEvents
            .whereEqualTo("lactationCycle", lactationCycle).find();
        if (lastCalvingEvent) {
            return res.status(200).json(lastCalvingEvent);
        }
        else {
            return res.status(404).json({
                code: "not found",
                // eslint-disable-next-line max-len
                message: "any event was found with the data provided",
            });
        }
    }
    catch (error) {
        const constraintError = utils_1.getConstrainsError((_a = error[0]) === null || _a === void 0 ? void 0 : _a.constraints);
        const responseError = constraintError ? constraintError : utils_1.getDefaultError(error);
        return res.status(400).json(responseError);
    }
};
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
exports.checkAnimalExist = async (req, res, next) => {
    var _a;
    const femaleBovineRepository = fireorm_1.getRepository(femaleBovine_1.default);
    try {
        let bovineIdentifier;
        let ranchIdentifier;
        if (req.body.bovineIdentifier && req.body.ranchIdentifier) {
            bovineIdentifier = req.body.bovineIdentifier;
            ranchIdentifier = req.body.ranchIdentifier;
        }
        else {
            bovineIdentifier = req.query.bovine;
            ranchIdentifier = req.query.ranch;
        }
        const femaleBovineRef = await femaleBovineRepository
            .whereEqualTo("ranchIdentifier", ranchIdentifier)
            .whereEqualTo("id", bovineIdentifier).findOne();
        if (!femaleBovineRef) {
            return res.status(404).json({
                code: "not found",
                message: "animal not found",
            });
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
function getTimestampByDate(date) {
    return firestore_1.firestore.Timestamp
        .fromMillis(moment(date, "YYYY/MM/DD").valueOf());
}
exports.updateHeatStatus = async (req, res) => {
    const repository = fireorm_1.getRepository(femaleBovine_1.default);
    const femaleAnimals = await repository
        .orderByAscending((femaleAnimal) => femaleAnimal.id)
        .limit(50)
        .find();
    for (const femaleBovine of femaleAnimals) {
        let sendHeatNotification = false;
        const pregnantEvent = await getSuccessfulPregnantEventByFemaleBovine(femaleBovine);
        if (!pregnantEvent) {
            const lastHeatEvent = await getLastHeatEventByFemaleBovine(femaleBovine);
            if (lastHeatEvent) {
                // calculate based on last heat event
                sendHeatNotification = checkHeatBoundary(lastHeatEvent.date);
                console.log(femaleBovine.internalIdentifier, sendHeatNotification, "by heat");
            }
            else {
                // calculate based on last pregnant date
                const lastCalvingEvent = await getLastCalvingEventByFemaleBovine(femaleBovine);
                if (lastCalvingEvent) {
                    sendHeatNotification = checkHeatBoundary(lastCalvingEvent.date);
                    console.log(femaleBovine.internalIdentifier, sendHeatNotification, "by calving");
                }
                else {
                    // calculate based on birthday
                    sendHeatNotification = checkHeatBoundary(moment(femaleBovine.birthday)
                        .add(360, "d").milliseconds());
                    console.log(femaleBovine.internalIdentifier, sendHeatNotification, "by birthday");
                }
            }
        }
    }
    return res.status(200).send();
};
async function getSuccessfulPregnantEventByFemaleBovine(femaleBovine) {
    return await femaleBovine.pregnantEvents
        .whereIn("type", ["TOUCH_POSITIVE_PREGNANT", "ULTRASOUND_POSITIVE_PREGNANT"])
        .findOne();
}
async function getLastHeatEventByFemaleBovine(femaleBovine) {
    return (await femaleBovine.heatEvents
        .orderByDescending((heatEvent) => heatEvent.date)
        .limit(1).find())[0];
}
async function getLastCalvingEventByFemaleBovine(femaleBovine) {
    return (await femaleBovine.calvingEvents
        .orderByDescending((calvingEvent) => calvingEvent.date)
        .limit(1).find())[0];
}
function checkHeatBoundary(date) {
    for (let i = 1; i <= 10; i++) {
        if (moment(date).isBetween(moment().subtract((i * 21) + 3, "d"), moment().subtract((i * 21) - 3, "d"), undefined, "[]")) {
            return true;
        }
    }
    return false;
}
//# sourceMappingURL=event.controller.js.map