import { UpdateCheckerNotifier } from "./UpdateCheckerNotifier";
export { Language } from "./languages";
export { UpdateInfo } from "./UpdateCheckerNotifier";
export { UpdateCheckerNotifier } from "./UpdateCheckerNotifier";
export declare const updateCheckerNotifier: UpdateCheckerNotifier;

let _updateCheckerNotifier: any

Object.defineProperty(exports, "updateCheckerNotifier", {
    enumerable: true,
    get: () => {
      return _updateCheckerNotifier || doLoadAUpdateCheckerNotifier();
    },
  })

function doLoadAUpdateCheckerNotifier() {
  _updateCheckerNotifier = new UpdateCheckerNotifier();
  return _updateCheckerNotifier;
}
