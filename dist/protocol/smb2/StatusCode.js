"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var StatusCode;
(function (StatusCode) {
    StatusCode[StatusCode["Success"] = 0] = "Success";
    StatusCode[StatusCode["Pending"] = 259] = "Pending";
    StatusCode[StatusCode["MoreProcessingRequired"] = 3221225494] = "MoreProcessingRequired";
    StatusCode[StatusCode["FileNameNotFound"] = 3221225524] = "FileNameNotFound";
    StatusCode[StatusCode["FilePathNotFound"] = 3221225530] = "FilePathNotFound";
    StatusCode[StatusCode["FileClosed"] = 3221225768] = "FileClosed";
})(StatusCode || (StatusCode = {}));
exports.default = StatusCode;
