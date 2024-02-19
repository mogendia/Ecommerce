import joi from "joi"
import { generalFields } from "../../middleware/validation.js"

export const createReview = joi.object({
    comment : joi.string().min(1).max(1500).required(),
    rating : joi.number().min(1).max(5).required(),
    productId : generalFields.id
}).required()

export const updateReview = joi.object({
    comment : joi.string().min(1).max(1500),
    rating : joi.number().min(1).max(5),
    productId : generalFields.id,
    reviewId:generalFields.id
}).required()