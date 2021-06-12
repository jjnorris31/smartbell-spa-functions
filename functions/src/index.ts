
// eslint-disable-next-line @typescript-eslint/no-var-requires
const express = require("express");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const functions = require("firebase-functions");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const admin = require("firebase-admin");
import * as fireorm from "fireorm";
import * as morgan from "morgan";
import * as cors from "cors";
import userRoutes from "../routes/user.routes";
import ranchRoutes from "../routes/ranch.routes";
import bullRoutes from "../routes/bull.routes";

const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());


admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();
fireorm.initialize(db, {
  validateModels: true,
});


app.use("/user", userRoutes);
app.use("/ranch", ranchRoutes);
app.use("/bull", bullRoutes);

app.get("/hello", (req, res) => {
  return res.status(200).json({message: "Hello world"});
});


exports.app = functions.https.onRequest(app);
