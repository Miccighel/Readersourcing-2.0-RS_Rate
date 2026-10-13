import Dropzone from "../node_modules/dropzone/src/dropzone.js";
import {version} from "../node_modules/dropzone/package.json";

// The upstream source uses a development placeholder for the version.
Dropzone.version = version;
window.Dropzone = Dropzone;
