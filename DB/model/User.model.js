import mongoose, { Schema, Types, model } from "mongoose";

const userSchema = new Schema(
  {
    firstName: String,
    lastName: String,
    userName: {
      type: String,
      required: [true, "userName is required"],
      min: [2, "minimum length 2 char"],
      max: [20, "max length 2 char"], lowercase: true
    },
    email: {
      type: String,
      unique: [true, "email must be unique value"],
      required: [true, "userName is required"],
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    phone: {
      type: String,
    },
    role: {
      type: String,
      default: "User",
      enum: ["User", "Admin"],
    },

    status: {
      type: String,
      default: "offline",
      enum: ["offline", "online", "blocked"],
    },
    confirmEmail: {
      type: Boolean,
      default: false,
    },
    image: Object,
    gender: {
      type: String,
      default: "Male",
      enum: ["Male", "Female"],
    },
    address: String,
    DOB: String,
    forgetCode: {
      type: Number,
      default: null,
    },
    changePasswordTime: { type: Date },
    wishlist: [{ type: Types.ObjectId , ref:'Product'}],
  },
  {
    timestamps: true,
  }
);

const userModel = mongoose.models.User || model("User", userSchema);
export default userModel;
