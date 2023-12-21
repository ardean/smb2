"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var HeaderFlag;
(function (HeaderFlag) {
    HeaderFlag[HeaderFlag["Response"] = 1] = "Response";
    HeaderFlag[HeaderFlag["Async"] = 2] = "Async";
    HeaderFlag[HeaderFlag["Chained"] = 4] = "Chained";
    HeaderFlag[HeaderFlag["Signed"] = 8] = "Signed";
    HeaderFlag[HeaderFlag["Priority"] = 16] = "Priority";
    HeaderFlag[HeaderFlag["DfsOperation"] = 32] = "DfsOperation";
    HeaderFlag[HeaderFlag["ReplayOperation"] = 64] = "ReplayOperation";
})(HeaderFlag || (HeaderFlag = {}));
exports.default = HeaderFlag;
