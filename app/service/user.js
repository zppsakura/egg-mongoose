'use strict';

const Service = require('egg').Service;
const utility = require('utility');
const jwt = require('jsonwebtoken');
const JsonCode = require('../constant/JsonCode.js');


class UserService extends Service {
  async register(user) {
    if (user.password !== user.password_check) {
      return JsonCode.PASSWORD_SAME;
    }
    const user2 = {
      ...user,
      password: utility.md5(user.password),
    };
    const phone = await this.ctx.model.User.findOne({ phone: user.phone }).exec();
    if (!phone) {
      this.ctx.model.User.create(user2);
      return JsonCode.SUCCESS;
    }
    return JsonCode.USERNAME_ISHAS;
  }

  async login(user) {
    const nameInfo = await this.ctx.model.User.findOne({ phone: user.phone }).exec();
    if (!nameInfo) {
      const data = {
        code: JsonCode.DATA_NOT_FOUND,
      };
      return data;
    }
    const passwordInfo = await this.ctx.model.User.findOne({ name: user.name, password: utility.md5(user.password) }).exec();
    if (!passwordInfo) {
      const data = {
        code: JsonCode.PASSWORD_ERROR,
      };
      return data;
    }
    const token = jwt.sign({
      name: user.name,
      id: user._id,
    }, 'my_token', { expiresIn: '2h' });
    const data = {
      code: JsonCode.SUCCESS,
      data: token,
      msg: '登录成功',
    };
    return data;
  }

}

module.exports = UserService;
