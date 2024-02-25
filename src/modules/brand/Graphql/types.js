import { GraphQLID, GraphQLObjectType, GraphQLString } from "graphql";
import { imageType } from "../../product/GraphQl/types.js";


export const brandTypes =new GraphQLObjectType({
    name: "brandType",
    fields: {
      _id: { type: GraphQLID },
      name: { type: GraphQLString},
      image: { type: imageType('brandImage') },
    },
  })