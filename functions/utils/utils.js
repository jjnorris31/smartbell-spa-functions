// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
import {firestore} from "firebase-admin/lib/firestore";
import * as moment from "moment";
import {getRepository} from "fireorm";
import FemaleBovine from "../models/femaleBovine";

export const getConstrainsError = (constraint) => {
  if (constraint) {
    const code = Object.keys(constraint)[0];
    return {
      code,
      message: constraint[code],
    };
  }
  return null;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getDefaultError = (error) => {
  return {
    code: "Unexpected",
    message: error,
  };
};

export const getTimestampByDate = (date) => {
  if (date) {
    return firestore.Timestamp
      .fromMillis(moment(date, "YYYY/MM/DD").valueOf());
  } else {
    return firestore.Timestamp
      .fromMillis(moment().valueOf());
  }
}

export const getFemaleBovines = async (type, req) => {
  const femaleBovineRepository = getRepository(FemaleBovine);
  const {limit, page} = req.query;
  const ranchIdentifier = req.query.ranch;

  try {
    const response = {
      femaleBovines: [],
      count: 0,
    };
    let femaleBovines = [];
    if (type === 'HEIFER') {
      femaleBovines = await femaleBovineRepository
        .whereEqualTo("ranchIdentifier", ranchIdentifier)
        .whereEqualTo('deleteAt', null)
        .whereEqualTo("lactationCycle", 0)
        .find();
    } else {
      femaleBovines = await femaleBovineRepository
        .whereEqualTo("ranchIdentifier", ranchIdentifier)
        .whereEqualTo('deleteAt', null)
        .whereGreaterThan("lactationCycle", 0)
        .find();
    }

    const slicedFemaleBovines = femaleBovines.slice(limit * (page - 1), limit * (page));
    const lastCalvingPromises = [];

    slicedFemaleBovines.forEach(femaleBovine => {
      if (femaleBovine.lactationCycle !== '0') {
        lastCalvingPromises.push(
          femaleBovine.calvingEvents.whereEqualTo("lactationCycle", femaleBovine.lactationCycle)
            .whereEqualTo("abortReason", null).findOne()
        );
      } else {
        lastCalvingPromises.push(new Promise(() => {
          return null;
        }));
      }
    });
    const lastCalvingResponses = await Promise.all(lastCalvingPromises);
    slicedFemaleBovines.map((femaleBovines, index) => {
      femaleBovines.lastCalvingDate = lastCalvingResponses[index] ? lastCalvingResponses[index].date : null;
    });
    response.femaleBovines = slicedFemaleBovines;
    response.count = femaleBovines.length;
    return response;
  } catch (e) {
    throw e;
  }
}

export const getLastPregnantEvents = async (animals) => {
  let lastPregnantPromises = [];
  animals.forEach(animal => {
    if (animal.lactationCycle > 0) {
      lastPregnantPromises.push(
        animal.pregnantEvents
          .whereEqualTo("lactationCycle", animal.lactationCycle)
          .findOne()
      )
    } else {
      lastPregnantPromises.push(new Promise(() => {
        return null;
      }));
    }
  })
  const lastPregnantResponses = await Promise.all(lastPregnantPromises);
  return animals.map((animal, index) => {
    animal.lastPregnantDate = lastPregnantResponses[index] ? lastPregnantResponses[index].date : null;
    return animal;
  });
}

export const getLastCalvingEvents = async (animals) => {
  let lastCalvingPromises = [];
  animals.forEach(animal => {
    console.log({animal})
    if (animal.lactationCycle !== 0) {
      lastCalvingPromises.push(
        animal.calvingEvents
          .whereEqualTo("lactationCycle", animal.lactationCycle)
          .whereEqualTo("abortReason", null)
          .findOne()
      );
    } else {
      lastCalvingPromises.push(new Promise(() => {
        return null;
      }));
    }
  });
  const lastCalvingResponses = await Promise.all(lastCalvingPromises);
  return animals.map((animal, index) => {
    animal.lastCalvingDate = lastCalvingResponses[index] ? lastCalvingResponses[index].date : null;
    return animal;
  });
}

export function getCowsResponse(femaleBovines, count) {
  return {
    femaleBovines,
    count
  };
}

export const DEFAULT_GROUPS = [
  'DEFAULT'
]

