// @ts-ignore
import index from "../utils/algolia.js"
import {getRepository} from "fireorm";
import FemaleBovine from "../models/femaleBovine";
import Bull from "../models/bull";

export const indexData = async (req, res) => {
  const femaleRepository = getRepository(FemaleBovine);
  const maleRepository = getRepository(Bull);

  try {
    const femaleResponse = await femaleRepository
      .whereEqualTo('deleteAt', null)
      .whereEqualTo("isDead", false)
      .find();

    const maleResponse = await maleRepository
      .whereEqualTo('deleteAt', null)
      .find();

    let femaleRecords = femaleResponse.map((animal) => {
      return {
        internalIdentifier: animal.internalIdentifier,
        siniigaIdentifier: animal.siniigaIdentifier,
        ranchIdentifier: animal.ranchIdentifier,
        groupIdentifier: animal.groupIdentifier,
        animalType: animal.lactationCycle === 0 ? 'HEIFER' : 'COW'
      }
    });

    let maleRecords = maleResponse.map((animal) => {
      return {
        internalIdentifier: animal.internalIdentifier,
        siniigaIdentifier: animal.siniigaIdentifier,
        ranchIdentifier: animal.ranchIdentifier,
        animalType: 'BULL'
      }
    });

    const records = femaleRecords.concat(maleRecords);

    await index.clearObjects();
    await index.saveObjects(records, {autoGenerateObjectIDIfNotExist: true});
    return res.status(200).json();
  } catch (e) {
    console.log(e);
    return res.status(204).json();
  }
}
