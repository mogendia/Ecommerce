import * as orderController from "./controller/order.js";
import * as validators from "./order.validation.js";
import { Router } from "express";
import { auth } from "../../middleware/auth.js";
import { endPoint } from "./order.endPoint.js";
import { validation } from "../../middleware/validation.js";
const router = Router();

router.post(
  "/",
  auth(endPoint.create),
  validation(validators.createOrder),
  orderController.createOrder
);
router.patch(
  "/:orderId",
  auth(endPoint.cancel),
  validation(validators.cancelOrder),
  orderController.cancelOrder
);
router.patch(
  "/:orderId/admin",
  auth(endPoint.adminUpdateOrder),
  validation(validators.adminUpdateOrder),
  orderController.updateOrderByAdmin
);

export default router;
