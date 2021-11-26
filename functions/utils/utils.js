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
};

export const getFemaleBovines = async (type, req) => {
  const femaleBovineRepository = getRepository(FemaleBovine);
  const {limit, page} = req.query;
  const ranchIdentifier = req.query.ranch;

  const response = {
    femaleBovines: [],
    count: 0,
  };
  let femaleBovines = [];
  if (type === "HEIFER") {
    femaleBovines = await femaleBovineRepository
        .whereEqualTo("ranchIdentifier", ranchIdentifier)
        .whereEqualTo("deleteAt", null)
        .whereEqualTo("lactationCycle", 0)
        .find();
  } else {
    femaleBovines = await femaleBovineRepository
        .whereEqualTo("ranchIdentifier", ranchIdentifier)
        .whereEqualTo("deleteAt", null)
        .whereGreaterThan("lactationCycle", 0)
        .find();
  }

  const slicedFemaleBovines = femaleBovines.slice(limit * (page - 1), limit * (page));
  const lastCalvingPromises = [];

  slicedFemaleBovines.forEach((femaleBovine) => {
    if (femaleBovine.lactationCycle !== "0") {
      lastCalvingPromises.push(
          femaleBovine.calvingEvents
              .whereEqualTo("lactationCycle", femaleBovine.lactationCycle)
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
    femaleBovines.lastCalvingDate =
      lastCalvingResponses[index] ? lastCalvingResponses[index].date : null;
  });
  response.femaleBovines = slicedFemaleBovines;
  response.count = femaleBovines.length;
  return response;
};

export const getLastPregnantEvents = async (animals) => {
  const lastPregnantPromises = [];
  animals.forEach((animal) => {
    lastPregnantPromises.push(
        animal.pregnantEvents
            .whereEqualTo("lactationCycle", animal.lactationCycle)
            .findOne()
    );
  });
  const lastPregnantResponses = await Promise.all(lastPregnantPromises);
  return animals.map((animal, index) => {
    animal.lastPregnantDate = lastPregnantResponses[index] ? lastPregnantResponses[index].date : null;
    return animal;
  });
};

export const getLastHeatEvents = async (animals) => {
  const lastHeatResponses = await Promise.all(getLastHeatPromises(animals));
  return animals.map((animal, index) => {
    animal.lastHeatDate = lastHeatResponses[index] ? lastHeatResponses[index].date : null;
    return animal;
  });
};

function getLastHeatPromises(animals) {
  const lastHeatPromises = [];
  const lowerBoundDate = moment().subtract(18, "d").toDate();
  const upperBoundDate = moment().subtract(25, "d").toDate();
  animals.forEach((animal) => {
    lastHeatPromises.push(
        animal.heatEvents
            .whereEqualTo("lactationCycle", animal.lactationCycle)
            .whereLessOrEqualThan("date", lowerBoundDate)
            .whereGreaterOrEqualThan("date", upperBoundDate)
            .findOne()
    );
  });
  return lastHeatPromises;
}

export const getDistributionData = async (animals) => {
  const calvingBoundDate = moment().subtract(45, "d").toDate();
  const heatIdealDate = moment().subtract(21, "d");
  const lastPregnantPromises = [];
  const lastCalvingPromises = [];
  const lastHeatPromises = getLastHeatPromises(animals);

  animals.forEach((animal) => {
    lastPregnantPromises.push(
        animal.pregnantEvents
            .whereEqualTo("lactationCycle", animal.lactationCycle)
            .findOne()
    );

    lastCalvingPromises.push(
        animal.calvingEvents.whereEqualTo("lactationCycle", parseInt(animal.lactationCycle) - 1)
            .whereEqualTo("abortReason", null)
            .whereGreaterThan("date", calvingBoundDate)
            .findOne()
    );
  });

  const lastPregnantResponses = (await Promise.all(lastPregnantPromises)).filter((item) => item);
  const lastCalvingResponses = (await Promise.all(lastCalvingPromises)).filter((item) => item);
  const lastHeatResponses = (await Promise.all(lastHeatPromises)).filter((item) => item);
  const idealHeat = lastHeatResponses.filter((item) =>
    moment(item.date).format("D") === heatIdealDate.format("D"));
  return {
    pregnant: lastPregnantResponses.length,
    served: lastCalvingResponses.length,
    opened: animals.length - lastCalvingResponses.length,
    idealHeat: idealHeat.length,
    reviewHeat: lastHeatResponses.length - idealHeat.length,
    sick: 0,
  };
};

export const getLastCalvingEvents = async (animals) => {
  const lastCalvingPromises = [];
  animals.forEach((animal) => {
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
};

export function getCowsResponse(femaleBovines, count) {
  return {
    femaleBovines,
    count,
  };
}

export const DEFAULT_GROUPS = [
  "DEFAULT",
];

