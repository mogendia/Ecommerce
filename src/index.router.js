import morgan from "morgan";
import connectDB from "../DB/connection.js";
import authRouter from "./modules/auth/auth.router.js";
import branRouter from "./modules/brand/brand.router.js";
import cartRouter from "./modules/cart/cart.router.js";
import categoryRouter from "./modules/category/category.router.js";
import couponRouter from "./modules/coupon/coupon.router.js";
import orderRouter from "./modules/order/order.router.js";
import productRouter from "./modules/product/product.router.js";
import reviewsRouter from "./modules/reviews/reviews.router.js";
import subcategoryRouter from "./modules/subcategory/subcategory.router.js";
import userRouter from "./modules/user/user.router.js";
import { globalErrorHandling } from "./utils/errorHandling.js";
import cors from "cors";

const initApp = (app, express) => {
  var whitelist = ["http://example1.com", "http://example2.com"];
  //   var corsOptions = {
  //   origin: function (origin, callback) {
  //     if (whitelist.indexOf(origin) !== -1) {
  //       callback(null, true)
  //     } else {
  //       callback(new Error('Not allowed by CORS'))
  //     }
  //   }
  // }
     app.use(cors())

  // app.use(async (req, res, next) => {
  //   if (!whitelist.includes(req.header("origin"))) {
  //     return next(new Error("Not Allowed By CORS", 403));
  //   }
  //   await res.header("Access-Control-Allow-Origin", "*");
  //   await res.header("Access-Control-Allow-Header", "*");
  //   await res.header("Access-Control-Allow-Private-Network", "true");
  //   await res.header("Access-Control-Allow-Methods", "*");
  //   next();
  // });
  if (process.env.MOOD == "DEV") {
    app.use(morgan("dev"));
  } else {
    app.use(morgan("combined"));
  }
  //convert Buffer Data
  app.use(express.json({}));
  //Setup API Routing
  app.get(`/`, (req,res,next) => {
   return res.status(200).json({message:'Welcome To E-Commerce App'})
  });
  app.use(`/auth`, authRouter);
  app.use(`/user`, userRouter);
  app.use(`/product`, productRouter);
  app.use(`/category`, categoryRouter);
  app.use(`/subCategory`, subcategoryRouter);
  app.use(`/reviews`, reviewsRouter);
  app.use(`/coupon`, couponRouter);
  app.use(`/cart`, cartRouter);
  app.use(`/order`, orderRouter);
  app.use(`/brand`, branRouter);

  app.all("*", (req, res, next) => {
    res.status(404).send("In-valid Routing Plz check url  or  method ");
  });
  app.use(globalErrorHandling);
  connectDB();
};

export default initApp;
