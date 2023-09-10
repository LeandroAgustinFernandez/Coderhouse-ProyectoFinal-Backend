import multer from "multer";
import { __dirname } from "../utils.js";

const storage = multer.diskStorage({
  destination: function (request, file, cb) {
    const { type } = request.headers
    if ( type === 'products' ) cb(null, `${__dirname}/public/images/products`);
    if ( type === 'profile' ) cb(null, `${__dirname}/public/images/profile`);
    if ( type === 'documents' ) cb(null, `${__dirname}/public/images/documents`);
  },
  filename: function (request, file, cb) {
    cb(null, file.originalname);
  },
});

export const uploader = multer({ storage });