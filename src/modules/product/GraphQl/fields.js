import {GraphQLFloat,GraphQLList,GraphQLObjectType,GraphQLString,GraphQLInt,GraphQLID,GraphQLNonNull,} from "graphql";
import productModel from "../../../../DB/model/Product.model.js";
import { productType } from "./types.js";
import { graphValidation } from "../../../middleware/validation.js";
import * as validators from '../product.validation.js'
import { authGraph, roles } from "../../../middleware/auth.js";

export const products = {
  products: {
    type: new GraphQLList(productType),
    resolve: async () => {
      const products = await productModel.find().populate([
        {
          path: "brandId",
        },
      ]);
      return products;
    },
  },
};

export const productId = {
  type: productType,
  args: {
    id: { type:new GraphQLNonNull(GraphQLID) },
  },
  resolve: async (parent, args) => {
    const products = await productModel.findById(args.id);
    return products;
  },
};

export const updateStock = {
  type: productType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    stock: { type:new GraphQLNonNull(GraphQLInt) },
    authorization:{type: new GraphQLNonNull(GraphQLString)}
  },
  resolve: async (parent, args) => {
    await graphValidation(validators.updateStock,args)
   const userAuth= await authGraph(args.authorization, [roles.Admin])
    const { id, stock } = args;
    const product = await productModel.updateOne(
      {_id:id},
      { stock , updatedBy:userAuth._id },
      { new: true }
    );
    return product;
  },
};

export const deleteById = {
  type: productType,
  args: {
    id: { type:new GraphQLNonNull(GraphQLID) },
  },
  resolve: async (parent, args) => {
    const product = await productModel.findOneAndDelete(args.id);
    return product;
  },
};
