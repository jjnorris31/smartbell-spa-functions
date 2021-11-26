import Ranch from "../models/ranch";
import {getRepository} from "fireorm";
import {getConstrainsError, getDefaultError} from "../utils/utils";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createRanch = async (req, res) => {
  const ranchRepository = getRepository(Ranch);
  const role = res.locals.role;

  if (!["admin"].includes(role)) {
    return res.status(401)
        .json({message: "Unauthorized to create a ranch",
          code: "role/unauthorized"});
  }

  try {
    const {
      name,
      position,
      address,
    } = req.body;

    const newRanch = new Ranch();
    newRanch.name = name;
    newRanch.position = position;
    newRanch.address = address;
    newRanch.createDate = new Date();
    newRanch.userIdentifier = res.locals.uid;

    await ranchRepository.create(newRanch);
    return res.status(201).json({
      message: "A ranch was created",
    });
  } catch (error) {
    const constraintError = getConstrainsError(error[0].constraints);
    const responseError = constraintError ? constraintError : getDefaultError();
    return res.status(400).json(responseError);
  }
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getRanches = async (req, res) => {
  const ranchRepository = getRepository(Ranch);
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
  } catch (e) {
    return res.status(400).send({message: "Unexpected error"});
  }
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getRanch = async (req, res) => {
  const ranchRepository = getRepository(Ranch);
  const ranchId = req.params.id;
  const role = res.locals.role;

  if (!["admin"].includes(role)) {
    return res.status(401)
        .json({message: "Unauthorized to get a ranch",
          code: "role/unauthorized"});
  }

  try {
    const ranch = await ranchRepository.whereEqualTo("id", ranchId).findOne();
    return res.status(200).json(ranch);
  } catch (e) {
    console.log(e);
    return res.status(400).json({message: e.message});
  }
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const deleteRanch = async (req, res) => {
  const ranchRepository = getRepository(Ranch);
  const ranchId = req.params.id;
  const role = res.locals.role;

  if (!["admin"].includes(role)) {
    return res.status(401)
        .json({message: "Unauthorized to delete a ranch",
          code: "role/unauthorized"});
  }

  try {
    await ranchRepository.delete(ranchId);
    return res.status(200).send();
  } catch (e) {
    return res.status(400).json({message: e.message});
  }
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const updateRanch = async (req, res) => {
  const ranchRepository = getRepository(Ranch);
  const ranchId = req.params.id;
  const role = res.locals.role;

  if (!["admin"].includes(role)) {
    return res.status(401).json(
        {message: "Unauthorized to update a ranch",
          code: "role/unauthorized",
        });
  }

  try {
    const {
      name,
      position,
      address,
    } = req.body;

    const ranch = await ranchRepository.findById(ranchId);
    ranch.name = name;
    ranch.position = position;
    ranch.address = address;
    await ranchRepository.update(ranch);
    return res.status(200).send();
  } catch (e) {
    return res.status(400).json({message: e.message});
  }
};
