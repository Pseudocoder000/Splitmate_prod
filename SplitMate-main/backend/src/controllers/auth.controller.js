const authService = require("../services/auth.service");
const { success } = require("../utils/response");

class AuthController {
  async signup(req, res, next) {
    try {
      const data = await authService.signup(req.body, res);
      return success(res, data, 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const data = await authService.login(req.body, res);
      return success(res, data);
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      await authService.logout(req.user._id, res);
      return success(res, null);
    } catch (error) {
      next(error);
    }
  }

  async refresh(req, res, next) {
    try {
      const refreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

      const data = await authService.refresh(refreshToken, res);

      return success(res, data);
    } catch (error) {
      next(error);
    }
  }

  async me(req, res, next) {
    try {
      const data = await authService.me(req.user);
      return success(res, data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();