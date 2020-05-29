import FileAction from "../smb2/FileAction";

export default interface ChangeEntry {
  action: FileAction;
  actionName: string;
  filename: string;
}