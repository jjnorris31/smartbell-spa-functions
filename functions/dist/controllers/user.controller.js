"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setClaims = exports.verifyToken = exports.updateUser = exports.getUser = exports.createUser = void 0;
const user_1 = require("../models/user");
const fireorm_1 = require("fireorm");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const admin = require("firebase-admin");
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
exports.createUser = async (req, res) => {
    const userRepository = fireorm_1.getRepository(user_1.default);
    const uid = res.locals.uid;
    try {
        const { firstName, firstSurname, onBoarding, email, phone, roles, authUniqueIdentifier } = req.body;
        const newUser = new user_1.default();
        newUser.firstName = firstName;
        newUser.alerts = [
            { type: "SMS", active: true },
            { type: "EMAIL", active: true },
            { type: "PUSH", active: false },
        ];
        newUser.onBoarding = onBoarding;
        newUser.firstSurname = firstSurname;
        newUser.email = email;
        newUser.phone = phone;
        newUser.pushNotificationToken = null;
        newUser.roles = roles;
        newUser.authUniqueIdentifier = authUniqueIdentifier;
        await admin.auth().setCustomUserClaims(uid, { role: "admin" });
        await userRepository.create(newUser);
        return res.status(201).json({
            message: "An user was created",
        });
    }
    catch (e) {
        console.log(e);
        return res.status(400).json({ message: e.message });
    }
};
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
exports.getUser = async (req, res) => {
    const authorizationHeader = req.headers.authorization;
    const repository = fireorm_1.getRepository(user_1.default);
    const token = authorizationHeader && authorizationHeader.split(" ")[1];
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const uid = decodedToken.uid;
        const user = await repository
            .whereEqualTo("authUniqueIdentifier", uid).findOne();
        return res.status(200).json(user);
    }
    catch (e) {
        return res.status(403).json({ message: "Not valid token" });
    }
};
exports.updateUser = async (req, res) => {
    const repository = fireorm_1.getRepository(user_1.default);
    console.log({ req });
    const { email, phone, firstName, firstSurname, alerts, pushNotificationToken, onBoarding, } = req.body;
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader && authorizationHeader.split(" ")[1];
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const uid = decodedToken.uid;
        const user = await repository
            .whereEqualTo("authUniqueIdentifier", uid).findOne();
        user.email = email;
        user.pushNotificationToken = pushNotificationToken;
        user.phone = phone;
        user.firstName = firstName;
        user.firstSurname = firstSurname;
        user.alerts = alerts;
        user.onBoarding = onBoarding;
        await repository.update(user);
        return res.status(200).json(user);
    }
    catch (e) {
        console.log({ e });
        return res.status(403).json({ message: "Not valid token" });
    }
};
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
exports.verifyToken = async (req, res, next) => {
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader && authorizationHeader.split(" ")[1];
    if (token) {
        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            console.log({ decodedToken });
            res.locals.uid = decodedToken.uid;
            res.locals.role = decodedToken.role;
            next();
        }
        catch (e) {
            console.log({ e });
            if (e.code === "auth/id-token-expired") {
                return res.status(401).json({ message: "Token has expired" });
            }
            else {
                return res.status(403).json({ message: "Not valid token" });
            }
        }
    }
    else {
        return res.status(401).json({ message: "Not token provided" });
    }
};
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
exports.setClaims = async (req, res) => {
    const uid = res.locals.uid;
    if (uid) {
        await admin.auth().setCustomUserClaims(uid, { role: "admin" });
        return res.status(200).send();
    }
    else {
        return res.status(401).json({ message: "Not token provided" });
    }
};
//# sourceMappingURL=user.controller.js.map