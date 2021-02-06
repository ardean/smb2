import RemoteService from "../RemoteService";

export default class WorkstationService extends RemoteService {
  public serialize() {
    return Buffer.allocUnsafe(0);
  }
}