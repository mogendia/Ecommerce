import {
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from "graphql";
import * as productController from "./fields.js";

export const productSchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "productSchema",
    description: "handle product in GraphQl",
    fields: {
      products: productController.products,
      productId: productController.productId,
    },
  }),
  mutation:new GraphQLObjectType({
    name:'productMutation',
    fields: {
      updateStock: productController.updateStock,
      deleteById: productController.deleteById
    }
  })
});
