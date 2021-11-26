"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fireorm_1 = require("fireorm");
const class_validator_1 = require("class-validator");
let User = class User {
};
__decorate([
    class_validator_1.Validate(class_validator_1.isDefined, {
        message: "firstName is required",
    })
], User.prototype, "firstName", void 0);
__decorate([
    class_validator_1.Validate(class_validator_1.isDefined, {
        message: "firstSurname is required",
    })
], User.prototype, "firstSurname", void 0);
__decorate([
    class_validator_1.IsEmail()
], User.prototype, "email", void 0);
__decorate([
    class_validator_1.Validate(class_validator_1.isDefined, {
        message: "phone is required",
    })
], User.prototype, "phone", void 0);
__decorate([
    class_validator_1.Validate(class_validator_1.isDefined, {
        message: "obBoarding is required",
    })
], User.prototype, "obBoarding", void 0);
__decorate([
    class_validator_1.ArrayNotEmpty()
], User.prototype, "roles", void 0);
__decorate([
    class_validator_1.Validate(class_validator_1.isDefined, {
        message: "authUniqueIdentifier is required",
    }),
    class_validator_1.ArrayNotEmpty()
], User.prototype, "alerts", void 0);
User = __decorate([
    fireorm_1.Collection()
], User);
exports.default = User;
//# sourceMappingURL=user.js.map