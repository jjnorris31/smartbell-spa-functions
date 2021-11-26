"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDistribution = void 0;
const utils_1 = require("../utils/utils");
const femaleBovine_controller_1 = require("./femaleBovine.controller");
exports.getDistribution = async (req, res) => {
    const { limit, page, filter, values, search } = req.query;
    const { ranchId } = req.params;
    try {
        const foundFemaleAnimals = await femaleBovine_controller_1.getAllFemaleAnimals(ranchId, []);
        const distribution = await utils_1.getDistributionData(foundFemaleAnimals);
        return res.status(200).json(distribution);
    }
    catch (e) {
        return res.status(400).json(e);
    }
};
//# sourceMappingURL=dashboard.controller.js.map