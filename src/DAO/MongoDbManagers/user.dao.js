import { userModel } from "../models/user.model.js";

export default class UserManagerDB {
  async create(userInfo) {
    try {
      let result = await userModel.create(userInfo);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  async get(email) {
    try {
      let user = await userModel.findOne({ email }, { __v: 0 }).lean();
      if (!user) throw new Error(`User not exists.`);
      return user;
    } catch (error) {
      return { error: error.message };
    }
  }

  async getById(uid) {
    try {
      let user = await userModel.findOne({ _id: uid }, { __v: 0 }).lean();
      if (!user) throw new Error(`User not exists.`);
      return user;
    } catch (error) {
      return { error: error.message };
    }
  }

  async updatePassword({ email, newpassword }) {
    try {
      let user = await this.get(email);
      if (user?.error) throw new Error(user.error);
      let result = await userModel.updateOne(
        { email },
        {
          $set: {
            password: newpassword,
            recover_password: {
              id_url: null,
              createTime: null,
            },
          },
        }
      );
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  async recoverPassword(user) {
    try {
      let result = await userModel.updateOne(
        { email: user.email },
        { $set: { recover_password: user.recover_password } }
      );
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  async resetRecoverPassword(email) {
    try {
      let result = await userModel.updateOne(
        { email },
        {
          $set: {
            recover_password: {
              id_url: null,
              createTime: null,
            },
          },
        }
      );
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  async checkResetUrl(idurl) {
    try {
      let result = await userModel
        .findOne({ "recover_password.id_url": idurl })
        .lean();
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  async changeRole(uid) {
    try {
      let user = await userModel.findOne({ _id: uid }, { __v: 0 }).lean();
      if (!user) throw new Error(`User not exists.`);
      let newRole = user.role === "user" ? "premium" : "user";
      let result = await userModel.updateOne(
        { _id: uid },
        { $set: { role: newRole } }
      );
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  async setLastConnection(uid) {
    try {
      let result = await userModel.updateOne(
        { _id: uid },
        { $set: { last_connection: new Date().toISOString() } }
      );
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  async uploadDocuments(uid, documents) {
    try {
      let user = await userModel.findOne({ _id: uid }, { __v: 0 }).lean();
      if (!user) throw new Error(`User not exists.`);
      let result = await userModel.updateOne(
        { _id: uid },
        { $set: { documents } }
      );
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  async getAll() {
    try {
      let result = await userModel
        .find(
          {},
          { first_name: 1, last_name: 1, email: 1, role: 1, last_connection: 1 }
        )
        .lean();
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  async delete(uid) {
    try {
      let result = await userModel.deleteOne({ _id: uid })
      return result
    } catch (error) {
      return { error: error.message };
    }
  }
}
