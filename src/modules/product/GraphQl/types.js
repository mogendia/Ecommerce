import {
  GraphQLID,
  GraphQLList,
  GraphQLString,
  GraphQLFloat,
  GraphQLInt,
  GraphQLObjectType,
} from "graphql";
import { brandTypes } from "../../brand/Graphql/types.js";

export function imageType(name) {
  return new GraphQLObjectType({
    name: name || 'productImage',
    fields: {
      secure_url: { type: GraphQLString },
      publicId: { type: GraphQLString },
    },
  });
}
const customImage=imageType() // we made it as a function to solve dublicates

export const productType = new GraphQLObjectType({
  name: "Product",
  description: "Product description",
  fields: {
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    slug: { type: GraphQLString },
    price: { type: GraphQLFloat },
    discount: { type: GraphQLFloat },
    finalPrice: { type: GraphQLString },
    stock: { type: GraphQLInt },
    minImage: { type: customImage},
    subImages: { type:new GraphQLList(customImage) },
    categoryId: { type: GraphQLID },
    subcategoryId: { type: GraphQLID },
    brandId: {
      type: brandTypes,
    },
  },
});
