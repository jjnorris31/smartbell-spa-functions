"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Geopoint = void 0;
const fireorm_1 = require("fireorm");
const class_validator_1 = require("class-validator");
// eslint-disable-next-line new-cap,require-jsdoc
let Ranch = class Ranch {
};
__decorate([
    class_validator_1.Validate(class_validator_1.isDefined, {
        message: "name is required",
    }),
    class_validator_1.IsNotEmpty()
], Ranch.prototype, "name", void 0);
__decorate([
    class_validator_1.Validate(class_validator_1.isDefined, {
        message: "position is required",
    }),
    fireorm_1.Type(() => Geopoint)
], Ranch.prototype, "position", void 0);
__decorate([
    class_validator_1.Validate(class_validator_1.isDefined, {
        message: "address is required",
    }),
    class_validator_1.IsNotEmpty()
], Ranch.prototype, "address", void 0);
__decorate([
    class_validator_1.Validate(class_validator_1.isDefined, {
        message: "userIdentifier is required",
    })
], Ranch.prototype, "userIdentifier", void 0);
__decorate([
    class_validator_1.Validate(class_validator_1.IsDate, {
        message: "createDate is required",
    })
], Ranch.prototype, "createDate", void 0);
Ranch = __decorate([
    fireorm_1.Collection()
], Ranch);
class Geopoint {
}
exports.Geopoint = Geopoint;
exports.default = Ranch;
//# sourceMappingURL=ranch.js.map