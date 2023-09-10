import { response } from "express";
import {
  PRODUCT_SERVICES,
  CART_SERVICES,
  USER_SERVICES,
  TICKET_SERVICES,
} from "../services/servicesManager.js";

export const loginView = async (request, response) => {
  response.render("user/login", {
    title: "Login",
    style: "home",
    logued: false,
  });
};

export const resetPasswordView = async (request, response) => {
  let { idurl } = request.params;
  let result = await USER_SERVICES.checkResetUrl(idurl);
  if (!result?.email) {
    response.redirect("/recoverpassword");
    return;
  }
  let create = new Date(result.recover_password.createTime);
  let now = new Date();
  let minutes = (now.getTime() - create.getTime()) / 1000 / 60;
  if (minutes > 60) {
    await USER_SERVICES.resetRecoverPassword(result.email);
    response.redirect("/login");
    return;
  }
  response.render("user/resetpassword", {
    title: "Reset Password",
    style: "home",
    logued: false,
    email: result.email,
    idurl: result.recover_password.id_url,
  });
};

export const recoverPassword = async (request, response) => {
  response.render("user/recoverpassword", {
    title: "Recover Password",
    style: "home",
    logued: false,
  });
};

export const registerView = async (request, response) => {
  if (request.user?.email) return response.redirect("/products");
  response.render("user/register", {
    title: "Registro",
    style: "home",
    logued: false,
  });
};

export const perfilView = async (request, response) => {
  const { user } = request.user;
  response.render("user/perfil", {
    title: "Registro",
    style: "home",
    user,
    admin: user.role === "admin",
    role: user.role === "admin" || user.role === "premium",
    logued: true,
  });
};

export const productsView = async (request, response) => {
  const { user } = request.user;
  const { limit, sort, page, query } = request.query;
  const { docs, ...pag } = await PRODUCT_SERVICES.getProducts(
    parseInt(limit),
    page,
    query,
    sort
  );
  let urlParams = `?`;
  if (query) urlParams += `query=${query}&`;
  if (limit) urlParams += `limit=${limit}&`;
  if (sort) urlParams += `sort=${sort}&`;
  pag.prevLink = pag.hasPrevPage ? `${urlParams}page=${pag.prevPage}` : null;
  pag.nextLink = pag.hasNextPage ? `${urlParams}page=${pag.nextPage}` : null;
  response.render("products", {
    error: docs === undefined,
    products: docs,
    pag,
    title: "Products",
    style: "home",
    sort,
    query,
    user,
    admin: user.role === "admin",
    role: user.role === "admin" || user.role === "premium",
    cart: user.cart,
    logued: true,
  });
};

export const productDetailView = async (request, response) => {
  const { user } = request.user;
  let { pid } = request.params;
  let product = await PRODUCT_SERVICES.getProduct(pid);
  let error = product?.error ? true : false;
  response.render("productdetail", {
    error,
    product,
    user,
    title: `Product ${product.title}`,
    style: "home",
    logued: true,
    admin: user.role === "admin",
    role: user.role === "admin" || user.role === "premium",
    cart: user.cart,
  });
};

export const newProductView = async (request, response) => {
  const { user } = request.user;
  response.render("newproduct", {
    user,
    title: "Products",
    style: "home",
    logued: true,
    admin: user.role === "admin",
    role: user.role === "admin" || user.role === "premium",
  });
};

export const cartView = async (request, response) => {
  const { user } = request.user;
  const cid = user.cart;
  let { products, _id } = await CART_SERVICES.getCart(cid);
  response.render("carts", {
    user,
    title: "Products",
    style: "home",
    products,
    _id,
    display: products.length > 0 ? true : false,
    logued: true,
  });
};

export const logoutView = async (request, response) => {
  const { user } = request.user;
  await USER_SERVICES.setLastConnection(user._id);
  response.clearCookie("tokenBE").redirect("/login");
};

export const chatView = async (request, response) => {
  const { user } = request.user;
  response.render("chat", {
    title: "Chat",
    style: "styles",
    logued: true,
    user,
  });
};

export const purchaseView = async (request, response) => {
  const { user } = request.user;
  let { code } = request.params;
  let ticket = await TICKET_SERVICES.getTicket(code);
  if (ticket?.error) {
    return response.render("purchase", {
      title: "purchase",
      style: "styles",
      logued: true,
      user,
      ticket_error: true,
    });
  }
  response.render("purchase", {
    title: "purchase",
    style: "styles",
    logued: true,
    user,
    ticket_error: false,
    ticket,
  });
};

export const usersView = async (request, response) => {
  const { user } = request.user;
  let users = await USER_SERVICES.getAll();
  response.render("users", {
    title: "users",
    style: "styles",
    logued: true,
    user,
    users,
    admin: user.role === "admin",
    role: user.role === "admin" || user.role === "premium",
  });
};
