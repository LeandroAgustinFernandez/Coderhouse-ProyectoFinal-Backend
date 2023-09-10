import {
  CART_SERVICES,
  PRODUCT_SERVICES,
  TICKET_SERVICES,
} from "../services/servicesManager.js";

// ACCIONES DIRECTAS SOBRE EL CART //

export const getCart = async (request, response) => {
  const { cid } = request?.user?.cart || request?.params;
  let res = await CART_SERVICES.getCart(cid);
  res?.error
    ? response.status(404).send({ status: "error", payload: res.error })
    : response.send({ status: `success`, payload: res });
};

export const createCart = async (request, response) => {
  let res = await CART_SERVICES.createCart();
  if (res?.error) {
    request.logger.error(`ERROR => ${new Date()} - ${res.error}`);
    response.status(500).send({ status: "error", error: res.error });
  } else {
    response.status(201).send({ status: "success", payload: res });
  }
};

export const deleteCart = async (request, response) => {
  const { cid } = request.params;
  let res = await CART_SERVICES.deleteCart(cid);
  res?.error
    ? response.status(400).send({ status: "error", payload: res.error })
    : response.send({
        status: "success",
        payload: "The product list was successfully delete",
      });
};

export const updateCart = async (request, response) => {
  const { cid } = request.params;
  const { products } = request.body;
  let res = await CART_SERVICES.updateCart(cid, products);
  res?.error
    ? response.status(400).send({ status: "error", error: res.error })
    : response.send({
        status: "success",
        payload: "The cart was successfully updated",
      });
};

export const closeCart = async (request, response) => {
  const { cid } = request.params;
  const { user } = request.user;
 
  let cart = await CART_SERVICES.getCart(cid);

  if (cart.products.length > 0) {
    let amount = 0;
    let productWithoutStock = [];
    let purchaser = user.email;

    cart.products.forEach(async ({ product, quantity }) => {
      if (product?.stock >= quantity) {
        amount += product.price * quantity;
        product.stock -= quantity;
        await PRODUCT_SERVICES.updateProduct(product._id, product);
      } else {
        productWithoutStock.push({ product, quantity });
      }
    });

    if (amount > 0) {
      request.logger.info(
        `INFO => ${new Date()} - New purchase: ${(amount, purchaser)}`
      );
      let ticket_response = await TICKET_SERVICES.createTicket({ amount, purchaser });
      if (ticket_response?.error) {
        return response
          .status(500)
          .send({ status: "error", payload: ticket_response.error });
      } else {
        let res = await CART_SERVICES.updateCart(cid, productWithoutStock);
        return response.send({ status: "success", payload: { message: 'The purchase was completed successfully.', res, ticket_response} });
      }
    } else {
      return response.send({
        status: "error",
        payload: "No products available.",
      });
    }
  } else {
    return response.send({
      status: "error",
      payload: "There are no products in the cart.",
    });
  }
};

// ACCIONES CON PRODUCTOS SOBRE EL CART //

export const addProductInCart = async (request, response) => {
  const { user } = request.user;
  const { cid, pid } = request.params;
  if (user.role === "premium") {
    let res = await PRODUCT_SERVICES.getProduct(pid);
    if (res.owner.toString() === user._id) {
      return response
        .status(401)
        .send({ error: "You do not have permissions to perform this action" });
    }
  }
  let res = await CART_SERVICES.addProductInCart(cid, pid);
  res?.error
    ? response.status(400).send({ status: "error", error: res.error })
    : response.status(201).send({
        status: "success",
        payload: "The product was added successfully in cart",
      });
};

export const updateProductInCart = async (request, response) => {
  const { cid, pid } = request.params;
  const { quantity } = request.body;
  let res = await CART_SERVICES.updateProductInCart(cid, pid, quantity);
  res?.error
    ? response.status(400).send({ status: "error", error: res.error })
    : response.send({ status: "success", payload: res });
};

export const deleteProductInCart = async (request, response) => {
  const { cid, pid } = request.params;
  let res = await CART_SERVICES.deleteProductInCart(cid, pid);
  res?.error
    ? response.status(400).send({ status: "error", error: res.error })
    : response.send({
        status: "success",
        payload: `The product was successfully delete`,
      });
};
