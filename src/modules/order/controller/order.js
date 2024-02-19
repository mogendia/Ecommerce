import couponModel from "../../../../DB/model/Coupon.model.js";
import productModel from "../../../../DB/model/Product.model.js";
import orderModel from "../../../../DB/model/Order.model .js";
import cartModel from "../../../../DB/model/Cart.model .js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import { deleteItemsFromCart, emptyCart } from "../../cart/controller/cart.js";
import { createInvoice } from "../../../utils/pdf.js";
import sendEmail from "../../../utils/email.js";
import Stripe from "stripe";
import payment from "../../../utils/payment.js";

export const createOrder = asyncHandler(async (req, res, next) => {
  const { address, phone, note, couponName, paymentType } = req.body;
  // this way or in the bottom way (**this way we will replace all products to req.body.products**)
  if (!req.body.products) {
    const cart = await cartModel.findOne({ userId: req.user._id });
    if (!cart.products?.length) {
      return next(new Error("Empty card", { cause: 400 }));
    }
    req.body.isCart = true;
    req.body.products = cart.products;
  }
  if (couponName) {
    const coupon = await couponModel.findOne({
      name: couponName,
      usedBy: { $nin: req.user._id },
    });
    if (!coupon || coupon.expireDate.getTime() < Date.now()) {
      return next(new Error("In-valid or expired coupon", { cause: 400 }));
    }
    req.body.coupon = coupon;
  }

  const productIds = [];
  const finalProductList = [];
  let subtotal = 0;
  // product in this case(req.body.products) is (BSon => binary json)
  for (let product of req.body.products) {
    // make it let
    const checkedProduct = await productModel.findOne({
      _id: product.productId,
      stock: { $gte: product.quantity },
      isDeleted: false,
    });

    if (!checkedProduct) {
      return next(
        new Error(`In-valid productId ${product.productId}`, { cause: 400 })
      );
    }
    if (req.body.isCart) {
      // here we will make it object
      product = product.toObject();
    }

    product.name = checkedProduct.name;
    product.initPrice = checkedProduct.finalPrice;
    product.finalPrice =
      product.quantity * checkedProduct.finalPrice.toFixed(2);
    finalProductList.push(product);
    productIds.push(product.productId);
    subtotal += product.finalPrice;
  }

  const order = await orderModel.create({
    userId: req.user._id,
    note,
    phone,
    address,
    products: finalProductList,
    couponId: req.body.coupon?._id,
    paymentType,
    status: paymentType ? "waitPayment" : "placed",
    subtotal,
    finalPrice:
      subtotal - (subtotal * ((req.body.coupon?.amount || 0) / 100)).toFixed(2),
  });

  // decrease product stock

  for (const product of req.body.products) {
    await productModel.updateOne(
      { _id: product.productId },
      { $inc: { stock: -parseInt(product.quantity) } }
    );
  }

  // push userID in coupon // if coupon used

  if (req.body.coupon) {
    await couponModel.updateOne(
      { _id: req.body.coupon._id },
      { $addToSet: { usedBy: req.user._id } }
    );
  }

  // clear items from cart
  if (req.body.isCart) {
    await emptyCart(req.user._id);
  } else {
    await deleteItemsFromCarteItemsFromCart(productIds, req.user._id);
  }
  // invoice
  // const invoice = {
  //   shipping: {
  //     name: req.user.userName,
  //     address: order.address,
  //     city: "Cairo",
  //     state: "Cairo",
  //     country: "Egypt",
  //     postal_code: 94111,
  //   },
  //   items: order.products,
  //   subtotal: subtotal,
  //   total: order.finalPrice,
  //   invoice_nr: order._id,
  //   date: order.createdAt,
  // };

  // await createInvoice(invoice, "invoice.pdf");
  // await sendEmail({
  //   to: req.user.email,
  //   subject: "Invoice",
  //   attachments: [
  //     {
  //       path: "invoice.pdf",
  //       contentType: "application/pdf",
  //     },
  //   ],
  // });

  /**
   * !payment*/
  if (order.paymentType == "card") {
    const stripe = new Stripe(process.env.STRIPE_KEY);
    if (req.body.coupon) {
      const coupon = await stripe.coupons.create({percent_off: req.body.coupon.amount , duration:'once'});
      req.body.couponId = coupon.id; 
    }
    const line_items = [];

    for (const p of order.products) {
      if (typeof p.initPrice !== "number") {
        return res.status(400).json({ message: "Invalid unitPrice value" });
      }
      line_items.push({
       
            price_data: {
              currency: "USD",
              product_data: {
                name: p.name,
              },
              unit_amount: Math.round(p.initPrice * 100), // cent to dollar
            },
            quantity: p.quantity,
          
      });
    const session = await payment({
      stripe,
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: req.user.email,
      metadata: {
        orderId: order._id.toString(),
      },
      cancel_url: `${process.env.CANCEL_URL}?orderId=${order._id.toString()}`,
      line_items,
      discounts:req.body.couponId ? [{coupon:req.body.couponId}] : [],
    });
  return res.status(201).json({ message: "Done", order , session, url:session.url });

  }
  return res.status(201).json({ message: "Done", order });

}});

export const cancelOrder = async (req, res, next) => {
  const { reason } = req.body;
  const { orderId } = req.params;

  const order = await orderModel.findOne({
    _id: orderId,
    userId: req.user._id,
  });
  if (!order) {
    return next(new Error(`in-valid order ID `, { cause: 404 }));
  }
  if (
    (order?.status != "placed" && order.paymentType == "cash") ||
    (order?.status != "waitPayment" && order.paymentType == "card")
  ) {
    return next(
      new Error(
        `cannot cancel order after it has been changed ${order.status}`,
        { cause: 400 }
      )
    );
  }
  const cancelOrder = await orderModel.updateOne(
    { _id: order._id },
    { status: "canceled", reason, updatedBy: req.user._id }
  );

  if (!cancelOrder.matchedCount) {
    return next(new Error(`fail to cancel order `, { cause: 400 }));
  }
  // increase stock
  for (const product of order.products) {
    await productModel.updateOne(
      { _id: product.productId },
      { $inc: { stock: parseInt(product.quantity) } }
    );
  }

  // push userID in coupon // if coupon used

  if (req.body.coupon) {
    await couponModel.updateOne(
      { _id: order.couponId },
      { $pull: { usedBy: req.user._id } }
    );
  }
  return res.status(200).json({ message: "Done" });
};
export const updateOrderByAdmin = async (req, res, next) => {
  const { status } = req.body;
  const { orderId } = req.params;

  const order = await orderModel.findOne({
    _id: orderId,
    userId: req.user._id,
  });
  if (!order) {
    return next(new Error(`in-valid order ID `, { cause: 404 }));
  }
  const cancelOrder = await orderModel.updateOne(
    { _id: order._id },
    { status, updatedBy: req.user._id }
  );

  if (!cancelOrder.matchedCount) {
    return next(new Error(`fail to cancel order `, { cause: 400 }));
  }
  return res.status(200).json({ message: "Done" });
};
