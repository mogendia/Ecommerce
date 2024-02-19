import orderModel from "../../../../DB/model/Order.model .js";
import reviewModel from "../../../../DB/model/Review.model.js";

export const createReview = async (req, res, next) => {
  const { productId } = req.params;
  const order = await orderModel.findOne({
    userId: req.user._id,
    status: "delivered",
    "products.productId": productId,
  });
  if (!order) {
    return next(new Error("cannot review an order", { cause: 400 }));
  }
  if (await reviewModel.findOne({
    createdBy: req.user._id,
    productId,
    orderId: order._id,
  })) {
    return next(new Error("already checked", { cause: 400 }));
  }

  await reviewModel.create({
    comment,
    rating,
    productId,
    orderId: order._id,
    userId: req.user._id,
  });  return res.status(200).json({ message: "done" });
};

export const updateReview = async (req, res, next) => {
  
  const { productId, reviewId } = req.body;

  await reviewModel.updateOne({ productId, _id: reviewId }, req.body);

  return res.status(201).json({ message: "Done" });
};
