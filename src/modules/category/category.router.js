import * as categoryController from "./controller/category.js";
import * as validators from "./category.validation.js";
import subcategory from "../subcategory/subcategory.router.js";
import { validation } from "../../middleware/validation.js";
import { fileUpload, fileValidation } from "../../utils/multer.js";
import { auth, roles } from "../../middleware/auth.js";
import { endPoint } from "./category.endPoint.js";
import { Router } from "express";

const router = Router({ caseSensitive: true });

router.use("/:categoryId/subcategory", subcategory);

router.get("/",
categoryController.getCategories);

router.post(
  "/",
  auth(endPoint.create),
  fileUpload(fileValidation.image).single("image"),
  validation(validators.createCategory),
  categoryController.createCategory
);
router.put(
  "/:categoryId",
  auth(),
  fileUpload(fileValidation.image).single("image"),
  validation(validators.updateCategory),
  categoryController.updateCategory
);

export default router;
