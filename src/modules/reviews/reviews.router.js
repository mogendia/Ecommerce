import { auth } from "../../middleware/auth.js";
import * as reviewController from "./controller/review.js"
import * as validators from "./reviews.validation.js"
import {validation} from "../../middleware/validation.js"
import { Router } from "express";
import { endPoint } from "./reviews.endPoint.js";
const router = Router({mergeParams:true})




router.post('/',auth(endPoint.create),validation(validators.createReview),reviewController.createReview)
router.put('/',auth(endPoint.update),validation(validators.updateReview),reviewController.updateReview)




export default router