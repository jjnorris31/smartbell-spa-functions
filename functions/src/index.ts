
// eslint-disable-next-line @typescript-eslint/no-var-requires
const express = require("express");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const admin = require("firebase-admin");
import * as fireorm from "fireorm";
import * as morgan from "morgan";
import * as cors from "cors";
import userRoutes from "../routes/user.routes";
import algoliaRoutes from "../routes/algolia.routes";
import ranchRoutes from "../routes/ranch.routes";
import bullRoutes from "../routes/bulls.routes";
import femaleBovineRoutes from "../routes/femaleBovine.routes";
import cowRoutes from "../routes/cows.routes";
import eventRoutes from "../routes/event.routes";
import heiferRoutes from "../routes/heifers.routes";
import groupRoutes from "../routes/groups.routes";
import dashboardRoutes from "../routes/dasboard.routes";
import "../utils/algolia";

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

app.get("/", (req, res) => {
  res.status(200).send('Hello, world!').end();
});


app.use("/user", userRoutes);
app.use("/index", algoliaRoutes);
app.use("/ranch", ranchRoutes);
app.use("/ranches", bullRoutes, cowRoutes, femaleBovineRoutes, heiferRoutes, groupRoutes, dashboardRoutes);
app.use("/femaleBovine", cowRoutes);
app.use("/event", eventRoutes);
app.use("/heifers", heiferRoutes);

app.get("/hello", (req, res) => {
  return res.status(200).json({message: "Hello world"});
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

module.exports = app;
