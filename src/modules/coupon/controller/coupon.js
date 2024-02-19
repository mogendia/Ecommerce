import couponModel from "../../../../DB/model/Coupon.model.js";
import cloudinary from "../../../utils/cloudinary.js";
import { asyncHandler } from "../../../utils/errorHandling.js";

export const getCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await couponModel.find();
  return res.status(200).json({ message: "done", coupon });
});

export const createCoupon = asyncHandler(async (req, res, next) => {
  const name = req.body.name.toLowerCase(); // check if it dublicated
  if (await couponModel.findOne({ name })) {
    return next(new Error(`name already exists ${name}`, { cause: 409 }));
  }
  if (req.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      { folder: `${process.env.APP_NAME}/coupon` }
    );
    req.body.image = { secure_url, public_id };
  }

  req.body.createdBy = req.user._id;
  req.body.expireDate = new Date(req.body.expireDate);

  const coupon = await couponModel.create(req.body);

  return res.status(201).json({ message: "Done", coupon });
});

export const updateCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await couponModel.findById(req.params.couponId);
  if (!coupon) return next(new Error("in-valid coupon id", { cause: 400 }));

  if (req.body.name) {
    req.body.name = req.body.name.toLowerCase();
    if (req.body.name == coupon.name) {
      return next(
        new Error(`cant update coupon with same name`, { cause: 400 })
      );
    }
    if (await couponModel.findOne({ name: req.body.name })) {
      return next(
        new Error(`name already exists ${req.body.name}`, { cause: 409 })
      );
    }
    coupon.name = req.body.name;
    
  }
  if (req.body.amount) {
    coupon.amount = req.body.amount;
  }
  if (req.body.expireDate) {
    coupon.expireDate = new Date(req.body.expireDate)
  }
  coupon.name = req.body.name;

  if (req.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      { folder: `${process.env.APP_NAME}/coupon` }
    );
    if (coupon.image) {
      await cloudinary.uploader.destroy(coupon.image.public_id);
    }
    coupon.image = { secure_url, public_id };
  }
  coupon.updatedBy = req.user._id;
  await coupon.save();

  return res.status(201).json({ message: "Done", coupon });
});
