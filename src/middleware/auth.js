import userModel from "../../DB/model/User.model.js";
import { verifyToken } from "../utils/GenerateAndVerifyToken.js";
import { asyncHandler } from "../utils/errorHandling.js";
export const roles = {
  User: "User",
  Admin: "Admin",
  HR: "HR",
};
export const auth = (accessRoles = []) => {
  return asyncHandler(async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization?.startsWith(process.env.BEARER_KEY)) {
      return next(new Error("In-valid bearer key", { cause: 400 }));
    }
    const token = authorization.split(process.env.BEARER_KEY)[1];

    if (!token) {
      return next(new Error("In-valid token", { cause: 400 }));
    }

    const decoded = verifyToken({ token });
    if (!decoded?.id) {
      return next(new Error("In-valid token payload", { cause: 400 }));
    }
    const user = await userModel
      .findById(decoded.id)
      .select("userName email image role changePasswordTime");
    if (parseInt(user.changePasswordTime) > decoded.iat) {
      return next(new Error("Expired Token ", { cause: 400 }));
    }
    if (!user) {
      return next(new Error("Not Register Account", { cause: 401 }));
    }
    if (!accessRoles.includes(user.role)) { // may be role
      return next(new Error("un authorized user", { cause: 403 }));
    }
    req.user = user;
    return next();
  });
};
