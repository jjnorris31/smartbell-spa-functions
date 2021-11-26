import User from "../models/user";
import {getRepository} from "fireorm";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const admin = require("firebase-admin");

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createUser = async (req, res) => {
  const userRepository = getRepository(User);
  const uid = res.locals.uid;
  try {
    const {
      firstName,
      firstSurname,
      onBoarding,
      email,
      phone,
      roles,
      authUniqueIdentifier} = req.body;
    const newUser = new User();
    newUser.firstName = firstName;
    newUser.alerts = [
      {type: "SMS", active: true},
      {type: "EMAIL", active: true},
      {type: "PUSH", active: true},
    ];
    newUser.onBoarding = onBoarding;
    newUser.firstSurname = firstSurname;
    newUser.email = email;
    newUser.phone = phone;
    newUser.roles = roles;
    newUser.authUniqueIdentifier = authUniqueIdentifier;
    await admin.auth().setCustomUserClaims(uid, {role: "admin"});
    await userRepository.create(newUser);
    return res.status(201).json({
      message: "An user was created",
    });
  } catch (e) {
    console.log(e);
    return res.status(400).json({message: e.message});
  }
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getUser = async (req, res) => {
  const authorizationHeader = req.headers.authorization;
  const repository = getRepository(User);
  const token = authorizationHeader && authorizationHeader.split(" ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;
    const user = await repository
        .whereEqualTo("authUniqueIdentifier", uid).findOne();
    return res.status(200).json(user);
  } catch (e) {
    return res.status(403).json({message: "Not valid token"});
  }
};

export const updateUser = async (req, res) => {
  const repository = getRepository(User);
  console.log({req});
  const {
    email,
    phone,
    firstName,
    firstSurname,
    alerts,
    onBoarding,
  } = req.body;
  const authorizationHeader = req.headers.authorization;
  const token = authorizationHeader && authorizationHeader.split(" ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;
    const user = await repository
        .whereEqualTo("authUniqueIdentifier", uid).findOne();
    user.email = email;
    user.phone = phone;
    user.firstName = firstName;
    user.firstSurname = firstSurname;
    user.alerts = alerts;
    user.onBoarding = onBoarding;
    await repository.update(user);
    return res.status(200).json(user);
  } catch (e) {
    console.log({e});
    return res.status(403).json({message: "Not valid token"});
  }
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const verifyToken = async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;
  const token = authorizationHeader && authorizationHeader.split(" ")[1];
  if (token) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      console.log({decodedToken});
      res.locals.uid = decodedToken.uid;
      res.locals.role = decodedToken.role;
      next();
    } catch (e) {
      console.log({e});
      if (e.code === "auth/id-token-expired") {
        return res.status(401).json({message: "Token has expired"});
      } else {
        return res.status(403).json({message: "Not valid token"});
      }
    }
  } else {
    return res.status(401).json({message: "Not token provided"});
  }
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const setClaims = async (req, res) => {
  const uid = res.locals.uid;
  if (uid) {
    await admin.auth().setCustomUserClaims(uid, {role: "admin"});
    return res.status(200).send();
  } else {
    return res.status(401).json({message: "Not token provided"});
  }
};
