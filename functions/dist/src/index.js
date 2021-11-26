"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line @typescript-eslint/no-var-requires
const express = require("express");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const admin = require("firebase-admin");
const fireorm = require("fireorm");
const morgan = require("morgan");
const cors = require("cors");
const user_routes_1 = require("../routes/user.routes");
const algolia_routes_1 = require("../routes/algolia.routes");
const ranch_routes_1 = require("../routes/ranch.routes");
const bulls_routes_1 = require("../routes/bulls.routes");
const femaleBovine_routes_1 = require("../routes/femaleBovine.routes");
const cows_routes_1 = require("../routes/cows.routes");
const event_routes_1 = require("../routes/event.routes");
const heifers_routes_1 = require("../routes/heifers.routes");
const groups_routes_1 = require("../routes/groups.routes");
const dasboard_routes_1 = require("../routes/dasboard.routes");
require("../utils/algolia");
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
app.use("/user", user_routes_1.default);
app.use("/index", algolia_routes_1.default);
app.use("/ranch", ranch_routes_1.default);
app.use("/ranches", bulls_routes_1.default, cows_routes_1.default, femaleBovine_routes_1.default, heifers_routes_1.default, groups_routes_1.default, dasboard_routes_1.default);
app.use("/femaleBovine", cows_routes_1.default);
app.use("/event", event_routes_1.default);
app.use("/heifers", heifers_routes_1.default);
app.get("/hello", (req, res) => {
    return res.status(200).json({ message: "Hello world" });
});
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});
module.exports = app;
//# sourceMappingURL=index.js.map