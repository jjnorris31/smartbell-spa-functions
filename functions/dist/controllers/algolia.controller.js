"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexData = void 0;
const algolia_js_1 = require("../utils/algolia.js");
const fireorm_1 = require("fireorm");
const femaleBovine_1 = require("../models/femaleBovine");
const bull_1 = require("../models/bull");
exports.indexData = async (req, res) => {
    const femaleRepository = fireorm_1.getRepository(femaleBovine_1.default);
    const maleRepository = fireorm_1.getRepository(bull_1.default);
    try {
        const femaleResponse = await femaleRepository
            .whereEqualTo("deleteAt", null)
            .whereEqualTo("isDead", false)
            .find();
        const maleResponse = await maleRepository
            .whereEqualTo("deleteAt", null)
            .find();
        const femaleRecords = femaleResponse.map((animal) => {
            return {
                internalIdentifier: animal.internalIdentifier,
                siniigaIdentifier: animal.siniigaIdentifier,
                ranchIdentifier: animal.ranchIdentifier,
                groupIdentifier: animal.groupIdentifier,
                animalType: animal.lactationCycle === 0 ? "HEIFER" : "COW",
            };
        });
        const maleRecords = maleResponse.map((animal) => {
            return {
                internalIdentifier: animal.internalIdentifier,
                siniigaIdentifier: animal.siniigaIdentifier,
                ranchIdentifier: animal.ranchIdentifier,
                animalType: "BULL",
            };
        });
        const records = femaleRecords.concat(maleRecords);
        await algolia_js_1.default.clearObjects();
        await algolia_js_1.default.saveObjects(records, { autoGenerateObjectIDIfNotExist: true });
        return res.status(200).json();
    }
    catch (e) {
        console.log(e);
        return res.status(204).json();
    }
};
//# sourceMappingURL=algolia.controller.js.map