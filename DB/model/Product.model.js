import mongoose, { Schema, Types, model } from "mongoose";

const productSchema = new Schema(
  {
    customId: String,
    name: { type: String, required: true, trim: true, lowercase: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    stock: { type: Number, default: 1 },
    price: { type: Number, default: 1 },
    description: String,
    mainImage: { type: Object, required: true },
    subImages:{type:[Object]},
    finalPrice: { type: Number, default: 1 },
    size: [{type: String, enum: ["small", "medium", "large"] }],
    colors: [{
      type: String,
      default: "black",
    }],
    discount: { type: Number, default: 0 },
    categoryId: { type: Types.ObjectId, ref: "Category", required: true },
    subcategoryId: { type: Types.ObjectId, ref: "Subcategory", required: true },
    brandId: { type: Types.ObjectId, ref: "Brand", required: true },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Types.ObjectId, ref: "User" },
    wishUserList: [{ type: Types.ObjectId, ref: "User" }],
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
  }
);
productSchema.virtual('review',{
ref:'Review',
localField:'_id',
foreignField:'productId'
})
const productModel = mongoose.models.Product || model("Product", productSchema);

export default productModel;
