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
      return next(new Error("In-valid bearer key"));
    }
    const token = authorization.split(process.env.BEARER_KEY)[1];

    if (!token) {
      return next(new Error("In-valid token"));
    }

    const decoded = verifyToken({ token });
    if (!decoded?.id) {
      return next(new Error("In-valid token payload"));
    }
    const user = await userModel
      .findById(decoded.id)
      .select("userName email image role changePasswordTime");
    if (parseInt(user.changePasswordTime) > decoded.iat) {
      return next(new Error("Expired Token "));
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
export const authGraph = (authorization,accessRoles = []) => {
  try{
    if (!authorization?.startsWith(process.env.BEARER_KEY)) {
      throw new Error("In-valid bearer key");
    }
    const token = authorization.split(process.env.BEARER_KEY)[1];

    if (!token) {
      throw new Error("In-valid token");
    }

    const decoded = verifyToken({ token });
    if (!decoded?.id) {
      throw new Error("In-valid token payload");
    }
    if (parseInt(user.changePasswordTime) > decoded.iat) {
      throw new Error("Expired Token ");
    }
    if (!user) {
      throw new Error("Not Register Account");
    }
    if (!accessRoles.includes(user.role)) { // may be role
      throw new Error("un authorized user");
    }
    return user;

  }catch{
    throw new Error(error)
  }
 
    
};
