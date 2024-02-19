import cartModel from "../../../../DB/model/Cart.model .js";
import productModel from "../../../../DB/model/Product.model.js";

export const createCart = async (req, res, next) => {
  const { productId, quantity } = req.body;
  // check productId and quantity

  const product = await productModel.findById(productId);

  if (!product) {
    return next(new Error("In-Valid Product Id", { Cause: 400 }));
  }
  if (product.stock < quantity || product.isDeleted) {
    await productModel.updateOne(
      { _id: productId },
      $addToSet({ wishUserList: req.user._id })
    );
    return next(new Error("In-Valid Product quantity ", { Cause: 400 }));
  }
  // check cart if it exists
  const cart = await cartModel.findOne({ userId: req.user._id });
  if (!cart) {
    const newCart = await cartModel.create({
      userId: req.user._id,
      products: [{ productId, quantity }],
    });
    return res.status(200).json({ Message: "Done", cart: newCart });
  }
  // update old items
  let matchProduct = false;
  for (let i = 0; i < cart.products.length; i++) {
    if (cart.products[i].productId.toString() == productId) {
      cart.products[i].quantity = quantity;
      matchProduct = true;
      break;
    }
  }
  // push new items
  if (!matchProduct) {
    cart.products.push({ productId, quantity });
  }
  await cart.save();
  return res.status(200).json({ Message: "Done", cart });
};

export async function deleteItemsFromCart(productIds, userId) {
  await cartModel.updateOne(
    { userId },
    { $pull: { products: { productId: { $in: productIds } } } }
  );
}

export const deleteItems = async (req, res, next) => {
  const { productIds } = req.body;
  const cart = await deleteItemsFromCart(productIds, req.user._id);
  return res.status(200).json({ Message: "Done", cart });
};
export async function emptyCart(userId) {
  await cartModel.updateOne({ userId }, { products: [] });
}

export const clearCart = async (req, res, next) => {
  const cart = await emptyCart(req.user._id);
  return res.status(200).json({ Message: "Done", cart });
};
