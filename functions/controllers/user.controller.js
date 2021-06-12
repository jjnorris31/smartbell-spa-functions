import User from "../models/user";
import {getRepository} from "fireorm";
const admin = require("firebase-admin");

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createUser = async (req, res) => {
  const userRepository = getRepository(User);
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
    newUser.onBoarding = onBoarding;
    newUser.firstSurname = firstSurname;
    newUser.email = email;
    newUser.phone = phone;
    newUser.roles = roles;
    newUser.authUniqueIdentifier = authUniqueIdentifier;
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
  const token = authorizationHeader && authorizationHeader.split(" ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;
    const user = await User.whereEqualTo("authUniqueIdentifier", uid).findOne();
    console.log({user});
    return res.status(200).json(user);
  } catch (e) {
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
      res.locals.uid = decodedToken.uid;
      res.locals.role = decodedToken.role;
      next();
    } catch (e) {
      return res.status(403).json({message: "Not valid token"});
    }
  } else {
    return res.status(401).json({message: "Not token provided"});
  }
};

export const setClaims = async (req, res) => {
  const uid = res.locals.uid;
  if (uid) {
    await admin.auth().setCustomUserClaims(uid, {role: 'admin'});
    return res.status(200).send();
  } else {
    return res.status(401).json({message: "Not token provided"});
  }
};
