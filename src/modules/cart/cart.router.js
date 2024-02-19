import * as cartController from './controller/cart.js'
// import * as validators from './cart.validation.js'
import {endPoint} from "./cart.endPoint.js"
import {auth} from "../../middleware/auth.js"
import { Router } from "express";
const router = Router()




router.post('/',
auth(endPoint.create),
cartController.createCart)
router.patch('/:remove',
auth(endPoint.create),
cartController.deleteItems)

router.patch('/:clear',
auth(endPoint.create),
cartController.clearCart)




export default router