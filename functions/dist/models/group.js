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
let Group = class Group {
};
__decorate([
    class_validator_1.Validate(class_validator_1.isDefined, {
        message: "createdAt is required",
    }),
    class_validator_1.IsNotEmpty()
], Group.prototype, "createdAt", void 0);
__decorate([
    class_validator_1.Validate(class_validator_1.isDefined, {
        message: "description is required",
    }),
    class_validator_1.IsNotEmpty()
], Group.prototype, "description", void 0);
__decorate([
    class_validator_1.Validate(class_validator_1.isDefined, {
        message: "KPI is required",
    }),
    class_validator_1.IsNotEmpty()
], Group.prototype, "KPI", void 0);
__decorate([
    class_validator_1.Validate(class_validator_1.isDefined, {
        message: "name is required",
    }),
    class_validator_1.IsNotEmpty()
], Group.prototype, "name", void 0);
__decorate([
    class_validator_1.Validate(class_validator_1.isDefined, {
        message: "ranchIdentifier is required",
    }),
    class_validator_1.IsNotEmpty()
], Group.prototype, "ranchIdentifier", void 0);
__decorate([
    class_validator_1.Validate(class_validator_1.isDefined, {
        message: "type is required",
    }),
    class_validator_1.IsNotEmpty()
], Group.prototype, "type", void 0);
Group = __decorate([
    fireorm_1.Collection()
], Group);
exports.default = Group;
//# sourceMappingURL=group.js.map