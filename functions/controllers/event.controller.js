import Ranch from "../models/ranch";
import HeatEvent from "../models/events/heatEvent";
import {getRepository} from "fireorm";
import {firestore} from "firebase-admin/lib/firestore";
import * as moment from "moment";
import {getConstrainsError, getDefaultError} from "../utils/utils";
import CalvingEvent from "../models/events/calvingEvent";
import PregnantEvent from "../models/events/pregnantEvent";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createHeatEvent = async (req, res) => {
  const ranchRepository = getRepository(Ranch);

  try {
    const {
      internalIdentifier,
      ranchIdentifier,
      date,
      description,
      type,
      bullIdentifier,
      lactationCycle,
    } = req.body;

    const ranchRef = await ranchRepository.findById(ranchIdentifier);
    const femaleBovineRef = await ranchRef.femaleBovines
        .findById(internalIdentifier);

    if (!femaleBovineRef) {
      return res.status(404).json({
        code: "not found",
        // eslint-disable-next-line max-len
        message: "animal not found",
      });
    }

    const newHeatEvent = new HeatEvent();
    newHeatEvent.date = firestore.Timestamp
        .fromMillis(moment(date, "YYYY/MM/DD").valueOf());
    newHeatEvent.description = description;
    newHeatEvent.type = type;
    newHeatEvent.bullIdentifier = bullIdentifier;
    newHeatEvent.lactationCycle = lactationCycle;
    await femaleBovineRef.heatEvents.create(newHeatEvent);

    return res.status(201).json({
      message: "a heat event was created",
    });
  } catch (error) {
    const constraintError = getConstrainsError(error[0]?.constraints);
    const responseError = constraintError ? constraintError : getDefaultError();
    return res.status(400).json(responseError);
  }
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createCalvingEvent = async (req, res) => {
  const ranchRepository = getRepository(Ranch);

  try {
    const {
      internalIdentifier,
      ranchIdentifier,
      date,
      description,
      type,
      abortReason,
      abortType,
      lactationCycle,
    } = req.body;

    const ranchRef = await ranchRepository.findById(ranchIdentifier);
    const femaleBovineRef = await ranchRef.femaleBovines
        .findById(internalIdentifier);

    if (!femaleBovineRef) {
      return res.status(404).json({
        code: "not found",
        // eslint-disable-next-line max-len
        message: "animal not found",
      });
    }

    const newCalvingEvent = new CalvingEvent();
    newCalvingEvent.date = firestore.Timestamp
        .fromMillis(moment(date, "YYYY/MM/DD").valueOf());
    newCalvingEvent.description = description;
    newCalvingEvent.type = type;
    newCalvingEvent.abortReason = abortReason;
    newCalvingEvent.abortType = abortType;
    newCalvingEvent.lactationCycle = lactationCycle;
    await femaleBovineRef.calvingEvents.create(newCalvingEvent);

    return res.status(201).json({
      message: "a calving event was created",
    });
  } catch (error) {
    const constraintError = getConstrainsError(error[0]?.constraints);
    const responseError = constraintError ? constraintError : getDefaultError();
    return res.status(400).json(responseError);
  }
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getLastCalvingEvent = async (req, res) => {
  const ranchRepository = getRepository(Ranch);
  const ranchIdentifier = req.query.ranch;
  const bovineIdentifier = req.query.bovine;
  const lactationCycle = req.query.cycle;

  try {
    const ranchRef = await ranchRepository.findById(ranchIdentifier);
    const femaleBovineRef = await ranchRef.femaleBovines
        .findById(bovineIdentifier);
    let lastCalvingEvent = null;

    if (lactationCycle !== 0) {
      lastCalvingEvent = await femaleBovineRef.calvingEvents
          .whereEqualTo("lactationCycle", parseInt(lactationCycle))
          .whereEqualTo("abortType", null).findOne();
    } else {
      return res.status(417).json({
        code: "to low cycle",
        // eslint-disable-next-line max-len
        message: "a event with this cycle it is impossible",
      });
    }

    if (lastCalvingEvent) {
      return res.status(200).json(lastCalvingEvent);
    } else {
      return res.status(404).json({
        code: "not found",
        // eslint-disable-next-line max-len
        message: "a event with the data provided was not found",
      });
    }
  } catch (error) {
    const constraintError = getConstrainsError(error[0]?.constraints);
    const responseError = constraintError ? constraintError : getDefaultError();
    return res.status(400).json(responseError);
  }
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createPregnantEvent = async (req, res) => {
  const ranchRepository = getRepository(Ranch);

  try {
    const {
      internalIdentifier,
      ranchIdentifier,
      date,
      description,
      type,
      heatIdentifier,
      lactationCycle,
    } = req.body;

    const ranchRef = await ranchRepository.findById(ranchIdentifier);
    const femaleBovineRef = await ranchRef.femaleBovines
        .findById(internalIdentifier);

    if (!femaleBovineRef) {
      return res.status(404).json({
        code: "not found",
        message: "animal not found",
      });
    }

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

    const newPregnantEvent = new PregnantEvent();
    newPregnantEvent.date = firestore.Timestamp
        .fromMillis(moment(date, "YYYY/MM/DD").valueOf());
    newPregnantEvent.description = description;
    newPregnantEvent.type = type;
    newPregnantEvent.heatIdentifier = heatIdentifier;
    newPregnantEvent.lactationCycle = lactationCycle;
    await femaleBovineRef.pregnantEvents.create(newPregnantEvent);

    return res.status(201).json({
      message: "a pregnant event was created",
    });
  } catch (error) {
    const constraintError = getConstrainsError(error[0]?.constraints);
    const responseError = constraintError ? constraintError : getDefaultError();
    return res.status(400).json(responseError);
  }
};
