"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FilePipePrinterAccess;
(function (FilePipePrinterAccess) {
    FilePipePrinterAccess[FilePipePrinterAccess["ReadData"] = 1] = "ReadData";
    FilePipePrinterAccess[FilePipePrinterAccess["WriteData"] = 2] = "WriteData";
    FilePipePrinterAccess[FilePipePrinterAccess["AppendData"] = 4] = "AppendData";
    FilePipePrinterAccess[FilePipePrinterAccess["ReadEa"] = 8] = "ReadEa";
    FilePipePrinterAccess[FilePipePrinterAccess["WriteEa"] = 16] = "WriteEa";
    FilePipePrinterAccess[FilePipePrinterAccess["DeleteChild"] = 32] = "DeleteChild";
    FilePipePrinterAccess[FilePipePrinterAccess["Execute"] = 64] = "Execute";
    FilePipePrinterAccess[FilePipePrinterAccess["ReadAttributes"] = 128] = "ReadAttributes";
    FilePipePrinterAccess[FilePipePrinterAccess["WriteAttributes"] = 256] = "WriteAttributes";
    FilePipePrinterAccess[FilePipePrinterAccess["Delete"] = 65536] = "Delete";
    FilePipePrinterAccess[FilePipePrinterAccess["ReadControl"] = 131072] = "ReadControl";
    FilePipePrinterAccess[FilePipePrinterAccess["WriteDiscretionaryAccessControl"] = 262144] = "WriteDiscretionaryAccessControl";
    FilePipePrinterAccess[FilePipePrinterAccess["WriteOwner"] = 524288] = "WriteOwner";
    FilePipePrinterAccess[FilePipePrinterAccess["Synchronize"] = 1048576] = "Synchronize";
    FilePipePrinterAccess[FilePipePrinterAccess["AccessSystemSecurity"] = 16777216] = "AccessSystemSecurity";
    FilePipePrinterAccess[FilePipePrinterAccess["MaximumAllowed"] = 33554432] = "MaximumAllowed";
    FilePipePrinterAccess[FilePipePrinterAccess["GenericAll"] = 268435456] = "GenericAll";
    FilePipePrinterAccess[FilePipePrinterAccess["GenericExecute"] = 536870912] = "GenericExecute";
    FilePipePrinterAccess[FilePipePrinterAccess["GenericWrite"] = 1073741824] = "GenericWrite";
    FilePipePrinterAccess[FilePipePrinterAccess["GenericRead"] = -2147483648] = "GenericRead";
})(FilePipePrinterAccess || (FilePipePrinterAccess = {}));
exports.default = FilePipePrinterAccess;