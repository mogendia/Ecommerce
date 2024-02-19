import subcategoryModel from "../../../../DB/model/Subcategory.model .js";
import brandModel from "../../../../DB/model/Brand.model.js";
import userModel from "../../../../DB/model/User.model.js";
import productModel from "../../../../DB/model/Product.model.js";
import slugify from "slugify";
import cloudinary from "../../../utils/cloudinary.js";
import { nanoid } from "nanoid";
import { asyncHandler } from "../../../utils/errorHandling.js";
import ApiFeatures from "../../../utils/apifeatures.js";

export const productList = asyncHandler(async (req, res, next) => {
  const apiFeatures = new ApiFeatures(
    productModel.find().populate([
      {
        path: "review",
      },
    ]),
    req.query
  )
    .search()
    .sort()
    .paginate()
    .filter()
    .select();

  const products = await apiFeatures.mongooseQuery;
  for (let i = 0; i < products.length; i++) {
    let calcRating = 0;
    for (let j = 0; j < products[i].review.length; j++) {
      calcRating += products[i].review[j].rating;
    }
    let avgRating = calcRating / products[i].review.length;
    const product = products[i].toObject();
    product.avgRating = avgRating;
    products[i] = product;
  }
  return res.status(200).json({ message: "Done", products });
});

export const createProduct = asyncHandler(async (req, res, next) => {
  const { name, categoryId, subcategoryId, brandId, price, discount } =
    req.body;
  // check if category is already defined
  if (!(await subcategoryModel.findOne({ _id: subcategoryId, categoryId }))) {
    return next(
      new Error("In-Valid SubcategoryId or CategoryId", { Cause: 400 })
    );
  }
  // if (user.changePasswordTime === null || user.changePasswordTime === undefined) {
  //   return res.status(400).json({ message: "Change password time not available" });
  // }

  // Access the changePasswordTime property
  // const changePasswordTime = user.changePasswordTime;
  
  // check if brand is already defined

  if (!(await brandModel.findOne({ _id: brandId }))) {
    return next(
      new Error("In-Valid SubcategoryId or CategoryId", { Cause: 400 })
    );
  }

  req.body.slug = slugify(name, {
    replacement: "-",
    lower: true,
    trim: true,
  });

  //req.body.finalPrice = discount ? price - discount / 100 : price;

  req.body.finalPrice = Number.parseFloat(
    price - (price * (discount || 0)) / 100
  ).toFixed(2);
  req.body.customId = nanoid();
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.files.mainImage[0].path,
    {
      folder: `${process.env.APP_NAME}/product/${req.body.customId}`,
    }
  );
  req.body.mainImage = { secure_url, public_id };

  if (req.files.subImages) {
    req.body.subImages = [];
    for (const file of req.files.subImages) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        file.path,
        {
          folder: `${process.env.APP_NAME}/product/${req.body.customId}/subImages`,
        }
      );
      req.body.subImages.push({ secure_url, public_id });
    }
  }
  req.body.createdBy = req.user._id;
  const product = await productModel.create(req.body);

  if (!product) {
    return next(new Error("No product found", { Cause: 400 }));
  }
  return res.status(200).json({ message: "Done", product  });
});

export const updateProduct = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const product = await productModel.findById(productId);
  if (!product) {
    return next(new Error("No product found", { Cause: 400 }));
  }

  const { name, categoryId, subcategoryId, brandId, price, discount } =
    req.body;
  // check  category & brand
  if (!categoryId && !subcategoryId) {
    if (!(await subcategoryModel.findOne({ _id: subcategoryId, categoryId }))) {
      return next(
        new Error("In-Valid SubcategoryId or CategoryId", { Cause: 400 })
      );
    }
  }
  if (!brandId) {
    if (!(await brandModel.findOne({ _id: brandId }))) {
      return next(
        new Error("In-Valid SubcategoryId or CategoryId", { Cause: 400 })
      );
    }
  }
  // update slug
  if (!name) {
    req.body.slug = slugify(name, {
      replacement: "-",
      lower: true,
      trim: true,
    });
  }

  //update price

  if (price && discount) {
    req.body.finalPrice = Number.parseFloat(
      price - (price * discount) / 100
    ).toFixed(2);
  } else if (price) {
    req.body.finalPrice = Number.parseFloat(
      price - (price * product.discount) / 100
    ).toFixed(2);
  } else {
    req.body.finalPrice = Number.parseFloat(
      product.price - (product.price * discount) / 100
    ).toFixed(2);
  }

  if (req.files?.mainImage?.length) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.files.mainImage[0].path,
      {
        folder: `${process.env.APP_NAME}/product/${product.customId}`,
      }
    );
    await cloudinary.uploader.destroy(product.mainImage.public_id);
    req.body.mainImage = { secure_url, public_id };
  }

  if (req.files?.subImages?.length) {
    req.body.subImages = [];
    for (const file of req.files.subImages) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        file.path,
        {
          folder: `${process.env.APP_NAME}/product/${req.body.customId}/subImages`,
        }
      );
      req.body.subImages.push({ secure_url, public_id });
    }
  }
  req.body.updatedBy = req.user._id;

  await productModel.updateOne({ _id: product._id }, req.body);

  return res.status(200).json({ message: "Done" });
});

/// wishlist

export const addWishlist = async (req, res, next) => {
  if (!(await productModel.findById(req.params.productId))) {
    return next(new Error("In-Valid Product"));
  }
  await userModel.updateOne(
    { _id: req.user._id },
    { $addToSet: { wishlist: req.params.productId } }
  );
  return res.status(200).json({ message: "Done" });
};

export const removeToWishlist = async (req, res, next) => {
  await userModel.updateOne(
    { _id: req.user._id },
    { $pull: { wishlist: req.params.productId } }
  );
  return res.status(200).json({ message: "Done" });
};
