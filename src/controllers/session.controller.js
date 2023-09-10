import { USER_SERVICES, CART_SERVICES } from "../services/servicesManager.js";
import { v4 as uuidv4 } from "uuid";
import { createHash, isValidPassword } from "../utils/bcrypt.js";
import transport from "../utils/mailer.js";
import { generateToken } from "../utils/jwt.js";
import moment from "moment";

export const login = async (request, response) => {
  let { email, password } = request.body;
  if (!email || !password)
    return response
      .status(400)
      .send({ status: "error", payload: `You must complete all fields.` });
  const user = await USER_SERVICES.getUser(email);
  if (user?.error)
    return response
      .status(401)
      .send({ status: "error", payload: `User not found` });
  if (!isValidPassword(user, password))
    return response
      .status(401)
      .send({ status: "error", payload: `User or Password are wrong` });
  request.logger.info(`INFO => ${new Date()} - ${user.email} had log`);
  delete user.password;
  delete user.cart.products;
  await USER_SERVICES.setLastConnection(user._id);
  const token = generateToken(user);
  response
    .cookie("tokenBE", token, { maxAge: 60 * 60 * 1000 * 10, httpOnly: true })
    .send({
      status: "success",
      payload: {
        message: `Welcome, you will be automatically redirected shortly.`,
      },
    });
};

export const register = async (request, response) => {
  const { first_name, last_name, email, age, password } = request.body;
  let user = await USER_SERVICES.getUser(email);
  if (user?.email)
    return response.status(400).send({
      status: "error",
      payload: "Email already exists. Try anorther.",
    });
  let res = await CART_SERVICES.createCart();
  let newUser = {
    first_name,
    last_name,
    email,
    age,
    password: createHash(password),
    cart: { _id: res._id },
    role: "user",
  };
  let result = await USER_SERVICES.saveUser(newUser);
  let { password: pass, ...userAttributes } = newUser;
  const token = generateToken(userAttributes);
  response
    .cookie("tokenBE", token, { maxAge: 60 * 60 * 1000 * 10, httpOnly: true })
    .send({
      status: "success",
      payload: { message: "Registered correctly. Please go to login.", result },
    });
};

export const resetpassword = async (request, response) => {
  let { email, newpassword } = request.body;
  const user = await USER_SERVICES.getUser(email);
  if (user?.error)
    return response
      .status(401)
      .send({ status: "error", payload: `User not found` });
  if (isValidPassword(user, newpassword))
    return response.send({
      status: "error",
      payload: `The new password must be different to the old`,
    });
  newpassword = createHash(newpassword);
  let res = await USER_SERVICES.changePassword({ email, newpassword });
  res?.error
    ? response.status(400).send({ status: "error", payload: res.error })
    : response.send({
        status: "success",
        payload: { message: `Password modified succesfully. Please go to login.` },
      });
};

export const recoverpassword = async (request, response) => {
  let { email } = request.body;
  const user = await USER_SERVICES.getUser(email);
  if (user?.error)
    return response
      .status(401)
      .send({ status: "error", payload: `User not found` });
  user.recover_password = {
    id_url: uuidv4(),
    createTime: new Date(),
  };
  await USER_SERVICES.recoverPassword(user);
  user.recover_password.id_url;
  let result = await transport.sendMail({
    from: "Leandro Fernandez <micorre@gmail.com>",
    to: email,
    subject: "Recuperar contraseña",
    html: `<a href="http://localhost:8080/resetpassword/${user.recover_password.id_url}">Recuperar Contrasena</a>`,
  });
  response.send({ status: "success", payload: {message:"We sent you an email with the link to reset your password.", result} });
};

export const changeRole = async (request, response) => {
  const { uid } = request.params;
  let user = await USER_SERVICES.getUserById(uid);
  if (!user)
    response.status(404).send({ status: "error", payload: "User not found" });
  if (user.role === "admin")
    return response.status(404).send({
      status: "error",
      payload: "You can´t change an Admin user role.",
    });
  if (user.role === "user") {
    if (user.documents) {
      let identification = user.documents.find((doc) => doc.name !== "id");
      let addressVerification = user.documents.find(
        (doc) => doc.name !== "address"
      );
      let accountState = user.documents.find((doc) => doc.name !== "account");
      if (!identification || !addressVerification || !accountState)
        return response.status(404).send({
          status: "error",
          payload:
            "You must upload all of the documents to become an premium user.",
        });
    } else {
      return response.status(404).send({
        status: "error",
        payload:
          "You must upload all of the documents to become an premium user.",
      });
    }
  }
  let result = await USER_SERVICES.changeRole(uid);
  response.send({ status: "success", payload: result });
};

export const uploadDocuments = async (request, response) => {
  const { uid } = request.params;
  const { files } = request;
  try {
    let documents = [];
    files.forEach((file) => {
      documents.push({ name: file.fieldname, reference: file.filename });
    });
    let result = await USER_SERVICES.uploadDocuments(uid, documents);
    response.send({ status: "success", payload: result });
  } catch (error) {
    response.status(500).send({
      status: "error",
      payload: "There was an error uploading the documents",
    });
  }
};

export const current = async (request, response) => {
  const { user } = request.user;
  response.send({ user });
};

export const getAll = async (request, response) => {
  let result = await USER_SERVICES.getAll();
  result?.error
    ? response.status(500).send({ status: "error", payload: result.error })
    : response.send({ status: "success", payload: result });
};

export const deleteUsers = async (request, response) => {
  let date = moment();
  let users_result = await USER_SERVICES.getAll();
  if (users_result?.error)
    return response
      .status(500)
      .send({ status: "error", payload: users_result.error });
  users_result.forEach(async (user) => {
    let diff = 'last_connection' in user ? date.diff(moment(user.last_connection), "days") : null;
      if (diff > 2 || diff === null) {
      let user_delete = await USER_SERVICES.deleteInactiveUser(user._id);
      if (user_delete?.error)
        return response
          .status(500)
          .send({ status: "error", payload: users_result.error });
        else {
          await transport.sendMail({
            from: "Leandro Fernandez <micorre@gmail.com>",
            to: user.email,
            subject: "Su cuenta fue eliminada por inactividad",
            html: `<div>
              <p><strong>${user.first_name} ${user.last_name}</strong> tu cuenta fue eliminada ya que no hubo actividad por mas de 2 dias.</p>
            </div>`,
          });
        }
      }
  });
  response.send({ status: "success", payload: "All of the innactive users were deleted" });
};
