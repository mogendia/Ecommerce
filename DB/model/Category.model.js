import mongoose, { Schema, Types, model } from "mongoose";

const categorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true, lowercase: true},
    slug: { type: String, required: true }, // mo gendia => mo-gendia
    image: { type: Object, required: true },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Types.ObjectId, ref: "User" },
  },
  {
    toJSON: { virtuals: true }, // ضفنا الباقي عشان نجيب subcategory داخل category
    toObject: { virtuals: true },
    timestamps: true,
  }
);
categorySchema.virtual("subcategory", {
  localField: "_id",
  foreignField: "categoryId",
  ref: "Subcategory",
});
const categoryModel =
  mongoose.models.Category || model("Category", categorySchema);

export default categoryModel;
