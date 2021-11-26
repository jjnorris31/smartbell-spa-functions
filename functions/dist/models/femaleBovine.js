"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
const fireorm_1 = require("fireorm");
const heatEvent_1 = require("./events/heatEvent");
const calvingEvent_1 = require("./events/calvingEvent");
const pregnantEvent_1 = require("./events/pregnantEvent");
let FemaleBovine = class FemaleBovine {
};
__decorate([
    class_validator_1.Validate(class_validator_1.isDefined, {
        message: "birthday is required",
    }),
    class_validator_1.IsNotEmpty()
], FemaleBovine.prototype, "birthday", void 0);
__decorate([
    class_validator_1.Validate(class_validator_1.isDefined, {
        message: "breed is required",
    }),
    class_validator_1.IsNotEmpty()
], FemaleBovine.prototype, "breed", void 0);
__decorate([
    class_validator_1.Validate(class_validator_1.isDefined, {
        message: "groupIdentifier is required",
    }),
    class_validator_1.IsNotEmpty()
], FemaleBovine.prototype, "groupIdentifier", void 0);
__decorate([
    class_validator_1.Validate(class_validator_1.isDefined, {
        message: "lactationCycle is required",
    }),
    class_validator_1.IsNotEmpty()
], FemaleBovine.prototype, "lactationCycle", void 0);
__decorate([
    class_validator_1.Validate(class_validator_1.isDefined, {
        message: "isHeifer is required",
    }),
    class_validator_1.IsNotEmpty()
], FemaleBovine.prototype, "isHeifer", void 0);
__decorate([
    class_validator_1.Validate(class_validator_1.isDefined, {
        message: "isDead is required",
    }),
    class_validator_1.IsNotEmpty()
], FemaleBovine.prototype, "isDead", void 0);
__decorate([
    fireorm_1.SubCollection(heatEvent_1.default)
], FemaleBovine.prototype, "heatEvents", void 0);
__decorate([
    fireorm_1.SubCollection(calvingEvent_1.default)
], FemaleBovine.prototype, "calvingEvents", void 0);
__decorate([
    fireorm_1.SubCollection(pregnantEvent_1.default)
], FemaleBovine.prototype, "pregnantEvents", void 0);
FemaleBovine = __decorate([
    fireorm_1.Collection()
], FemaleBovine);
exports.default = FemaleBovine;
//# sourceMappingURL=femaleBovine.js.map