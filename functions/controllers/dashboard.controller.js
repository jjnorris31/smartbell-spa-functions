import {getDistributionData,
} from "../utils/utils";
import {getAllFemaleAnimals} from "./femaleBovine.controller";

export const getDistribution = async (req, res) => {
  const {limit, page, filter, values, search} = req.query;
  const {ranchId} = req.params;

  try {
    const foundFemaleAnimals = await getAllFemaleAnimals(ranchId, []);
    const distribution = await getDistributionData(foundFemaleAnimals);
    return res.status(200).json(distribution);
  } catch (e) {
    return res.status(400).json(e);
  }
};
