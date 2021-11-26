"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
class Animal {
}
__decorate([
    class_validator_1.Validate(class_validator_1.isDefined, {
        message: "birthday is required",
    }),
    class_validator_1.IsNotEmpty()
], Animal.prototype, "birthday", void 0);
__decorate([
    class_validator_1.Validate(class_validator_1.isDefined, {
        message: "breed is required",
    }),
    class_validator_1.IsNotEmpty()
], Animal.prototype, "breed", void 0);
__decorate([
    class_validator_1.Validate(class_validator_1.isDefined, {
        message: "groupIdentifier is required",
    }),
    class_validator_1.IsNotEmpty()
], Animal.prototype, "groupIdentifier", void 0);
__decorate([
    class_validator_1.Validate(class_validator_1.isDefined, {
        message: "lactationCycle is required",
    }),
    class_validator_1.IsNotEmpty()
], Animal.prototype, "lactationCycle", void 0);
class Calving {
}
exports.default = Animal;
//# sourceMappingURL=animal.js.map