import mongoose, { Schema, Types, model } from "mongoose";

const subcategorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true , lowercase: true},
    slug: { type: String, required: true, lowercase: true }, // mo gendia => mo-gendia
    image: { type: Object, required: true },
    categoryId: { type: Types.ObjectId, ref: "Category", required: true },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Types.ObjectId, ref: "User" },
    customId: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
);
const subcategoryModel =
  mongoose.models.Subcategory || model("Subcategory", subcategorySchema);

export default subcategoryModel;
