import RouterClass from "./Router.class.js";
import { uploader } from "../utils/multer.js";
import {
  deleteProduct,
  getProduct,
  getProducts,
  saveProduct,
  updateProduct,
  getMocksProducts,
} from "../controllers/product.controller.js";
import { authorizationRole, passportCall } from "../middleware/session.js";

class ProductRouterClass extends RouterClass {
  init() {
    this.get("/mocking-products", getMocksProducts);
    this.get("/", passportCall("jwt"), authorizationRole(["user", "admin", "premium"]), getProducts);
    this.post("/", passportCall("jwt"), authorizationRole(["admin", "premium"]), uploader.array("thumbnails"), saveProduct);
    this.get("/:pid", passportCall("jwt"), authorizationRole(["user", "admin", "premium"]), getProduct);
    this.delete("/:pid", passportCall("jwt"), authorizationRole(["admin", "premium"]), deleteProduct);
    this.put("/:pid", passportCall("jwt"), authorizationRole(["admin", "premium"]), updateProduct);
  }
}
export default ProductRouterClass;

