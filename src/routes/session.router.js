import RouterClass from "./Router.class.js";
import { current, login, recoverpassword, register, resetpassword, changeRole, uploadDocuments, getAll, deleteUsers } from "../controllers/session.controller.js";
import { authorizationRole, passportCall } from "../middleware/session.js";
import { uploader } from "../utils/multer.js";

class SessionRouterClass extends RouterClass {
  init() {
    this.get("/", getAll);
    this.post("/login", login);
    this.post("/register", register);
    this.post("/resetpassword", resetpassword);
    this.post("/recoverpassword", recoverpassword);
    this.get("/current", passportCall("jwt"), current);
    this.get("/premium/:uid", changeRole);
    this.post("/:uid/documents", uploader.any(), uploadDocuments)
    this.delete("/", passportCall("jwt"), authorizationRole(["admin"]), deleteUsers)
  }
}

export default SessionRouterClass;
