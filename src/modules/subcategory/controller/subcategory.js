import slugify from "slugify";
import subcategoryModel from "../../../../DB/model/Subcategory.model .js";
import categoryModel from "../../../../DB/model/Category.model.js";
import cloudinary from "../../../utils/cloudinary.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import { nanoid } from "nanoid";

export const getSubcategories = asyncHandler(async (req, res, next) => {
  const subcategory = await subcategoryModel.find();
  return res.status(200).json({ message: "done", subcategory });
});

export const createSubcategory = asyncHandler(async (req, res, next) => {
  const {categoryId} = req.params
  if (!(await categoryModel.findById(categoryId))) {
    return next(new Error(`In-Valid categoryId `, { cause: 400 }));
  }
  const name = req.body.name.toLowerCase(); // check if it dublicated
  if (await subcategoryModel.findOne({ name })) {
    return next(
      new Error(`Duplicate Subcategory Name ${name}`, { cause: 409 })
    );
  }
  const customId = nanoid();
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    { folder: `${process.env.APP_NAME}/category/${categoryId}/${customId}` }
  );
  req.body.image = { secure_url, public_id }
  const subcategory = await subcategoryModel.create({
    name,
    image: req.body.image,
    slug: slugify(name, "-"),
    categoryId,
    customId,
    createdBy: req.user._id,
  });
  return res.status(201).json({ message: "Done", subcategory });
});

export const updateSubcategory = asyncHandler(async (req, res, next) => {
  const { categoryId, subcategoryId } = req.params;
  const subcategory = await subcategoryModel.findOne({
    _id: subcategoryId,
    categoryId,
  });
  if (!subcategory)
    return next(new Error("in-valid subcategory id", { cause: 400 }));

  if (req.body.name) {
    req.body.name = req.body.name.toLowerCase();
    if (req.body.name == subcategory.name) {
      return next(
        new Error(`cant update subcategory with same name`, { cause: 400 })
      );
    }
    if (await subcategoryModel.findOne({ name: req.body.name })) {
      return next(
        new Error(`name already exists ${req.body.name}`, { cause: 409 })
      );
    }
    subcategory.name = req.body.name;
    subcategory.slug = slugify(req.body.name, "-");
  }

  if (req.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.APP_NAME}/category/${categoryId}/${subcategory.customId}`,
      }
    );
    await cloudinary.uploader.destroy(subcategory.image.public_id);
    subcategory.image = { secure_url, public_id };
  }
  subcategory.updatedBy = req.user._id;
  await subcategory.save();

  return res.status(201).json({ message: "Done", subcategory });
});
