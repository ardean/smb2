"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CreateDispositionType;
(function (CreateDispositionType) {
    CreateDispositionType[CreateDispositionType["Supersede"] = 0] = "Supersede";
    CreateDispositionType[CreateDispositionType["Open"] = 1] = "Open";
    CreateDispositionType[CreateDispositionType["Create"] = 2] = "Create";
    CreateDispositionType[CreateDispositionType["OpenIf"] = 3] = "OpenIf";
    CreateDispositionType[CreateDispositionType["Overwrite"] = 4] = "Overwrite";
    CreateDispositionType[CreateDispositionType["OverwriteIf"] = 5] = "OverwriteIf";
})(CreateDispositionType || (CreateDispositionType = {}));
exports.default = CreateDispositionType;
