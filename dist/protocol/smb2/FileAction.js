"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FileAction;
(function (FileAction) {
    FileAction[FileAction["Added"] = 1] = "Added";
    FileAction[FileAction["Removed"] = 2] = "Removed";
    FileAction[FileAction["Modified"] = 3] = "Modified";
    FileAction[FileAction["RenamedOldName"] = 4] = "RenamedOldName";
    FileAction[FileAction["RenamedNewName"] = 5] = "RenamedNewName";
    FileAction[FileAction["AddedStream"] = 6] = "AddedStream";
    FileAction[FileAction["RemovedStream"] = 7] = "RemovedStream";
    FileAction[FileAction["ModifiedStream"] = 8] = "ModifiedStream";
    FileAction[FileAction["RemovedByDelete"] = 9] = "RemovedByDelete";
    FileAction[FileAction["IdNotTunnelled"] = 10] = "IdNotTunnelled";
    FileAction[FileAction["TunnelledIdCollision"] = 11] = "TunnelledIdCollision";
})(FileAction || (FileAction = {}));
exports.default = FileAction;
