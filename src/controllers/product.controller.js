import {
  PRODUCT_SERVICES,
  USER_SERVICES,
} from "../services/servicesManager.js";
import { generateProduct } from "../utils/faker.js";
import transport from "../utils/mailer.js";

export const getProducts = async (request, response) => {
  const { limit, sort, page, query } = request.query;
  let res = await PRODUCT_SERVICES.getProducts(
    parseInt(limit),
    page,
    query,
    sort
  );
  let urlParams = `/api/products?`;
  if (query) urlParams += `query=${query}&`;
  if (limit) urlParams += `limit=${limit}&`;
  if (sort) urlParams += `sort=${sort}&`;
  res.prevLink = res.hasPrevPage ? `${urlParams}page=${res.prevPage}` : null;
  res.nextLink = res.hasNextPage ? `${urlParams}page=${res.nextPage}` : null;
  res?.error
    ? response.send({ status: `error`, products: res })
    : response.send({ status: `success`, products: res });
};

export const getProduct = async (request, response) => {
  const { pid } = request.params;
  let res = await PRODUCT_SERVICES.getProduct(pid);
  res?.error
    ? response.status(404).send({ status: `error`, error: res.error })
    : response.send({ status: `success`, product: res });
};

export const saveProduct = async (request, response) => {
  const { user } = request.user;
  const io = request.app.get("socketio");
  const { files, body } = request;
  let product = { ...body, status: true };
  let thumbnails = files.map((file) => file.originalname);
  product.thumbnails = thumbnails || [];
  product.owner = user._id;
  let res = await PRODUCT_SERVICES.saveProduct(product);
  let res2 = await PRODUCT_SERVICES.getProducts();
  res?.error
    ? response.status(500).send({ status: "error", payload: res.error })
    : response.status(201).send({
        status: "success",
        payload: { message: `The product was successfully added.` },
      });
  io.emit("products", res2);
};

export const deleteProduct = async (request, response) => {
  const { user } = request.user;
  let { pid } = request.params;
  let product_result = await PRODUCT_SERVICES.getProduct(pid);
  if (user.role === "premium") {
    if (product_result.owner.toString() !== user._id) {
      return response
        .status(401)
        .send({ error: "You do not have permissions to perform this action" });
    }
  }
  let res = await PRODUCT_SERVICES.deleteProduct(pid);
  if (res?.error) {
    response.status(500).send({ status: "error", payload: res.error });
  } else {
    let owner = await USER_SERVICES.getUserById(product_result.owner);
    if (owner.role === "premium") {
      await transport.sendMail({
        from: "Leandro Fernandez <micorre@gmail.com>",
        to: owner.email,
        subject: "Producto eliminado.",
        html: `<p>El producto ${product_result.title} fue eliminado.</p>`,
      });
    }
    response.send({
      status: "success",
      payload: "The product was successfully removed",
    });
  }
};

export const updateProduct = async (request, response) => {
  let { pid } = request.params;
  let res = await PRODUCT_SERVICES.updateProduct(pid, request.body);
  res?.error
    ? response.status(400).send({ status: "error", payload: res.error })
    : response.send({
        status: "success",
        payload: "The product was update succefully",
      });
};

export const getMocksProducts = async (request, response) => {
  let products = [];
  for (let i = 0; i < 100; i++) {
    products.push(generateProduct());
  }
  response.send(products);
};
