"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ShareAccessType;
(function (ShareAccessType) {
    ShareAccessType[ShareAccessType["Read"] = 1] = "Read";
    ShareAccessType[ShareAccessType["Write"] = 2] = "Write";
    ShareAccessType[ShareAccessType["Delete"] = 4] = "Delete";
})(ShareAccessType || (ShareAccessType = {}));
exports.default = ShareAccessType;
