import userModel from "../../../../DB/model/User.model.js";
import {
  generateToken,
  verifyToken,
} from "../../../utils/GenerateAndVerifyToken.js";
import { compare, hash } from "../../../utils/HashAndCompare.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import sendEmail from "../../../utils/email.js";
import { customAlphabet } from "nanoid";

export const signup = asyncHandler(async (req, res, next) => {
  const { userName, email, password } = req.body;

  // check if user already exists

  if (await userModel.findOne({ email:email.toLowerCase() })) {
    return next(new Error("Email already exists", { cause: 409 }));
  }
  // confirm Email
  const token = generateToken({
    payload: { email },
    signature: process.env.EMAIL_TOKEN,
    expiresIn: 60 * 5,
  });
  const reToken = generateToken({
    payload: { email },
    signature: process.env.EMAIL_TOKEN,
    expiresIn: 60 * 60 * 24 * 30,
  });
  const link = ` ${req.protocol}://${req.headers.host}/auth/confirmEmail/${token}`;
  const reLink = `${req.protocol}://${req.headers.host}/auth/newConfirmEmail/${reToken}`;

  const html = `<!DOCTYPE html>
  <html>
  <head>
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"></head>
  <style type="text/css">
  body{background-color: #88BDBF;margin: 0px;}
  </style>
  <body style="margin:0px;"> 
  <table border="0" width="50%" style="margin:auto;padding:30px;background-color: #F3F3F3;border:1px solid #630E2B;">
  <tr>
  <td>
  <table border="0" width="100%">
  <tr>
  <td>
  <h1>
      <img width="100px" src="https://res.cloudinary.com/ddajommsw/image/upload/v1670702280/Group_35052_icaysu.png"/>
  </h1>
  </td>
  <td>
  <p style="text-align: right;"><a href="http://localhost:4200/#/" target="_blank" style="text-decoration: none;">View In Website</a></p>
  </td>
  </tr>
  </table>
  </td>
  </tr>
  <tr>
  <td>
  <table border="0" cellpadding="0" cellspacing="0" style="text-align:center;width:100%;background-color: #fff;">
  <tr>
  <td style="background-color:#630E2B;height:100px;font-size:50px;color:#fff;">
  <img width="50px" height="50px" src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703716/Screenshot_1100_yne3vo.png">
  </td>
  </tr>
  <tr>
  <td>
  <h1 style="padding-top:25px; color:#630E2B">Email Confirmation</h1>
  </td>
  </tr>
  <tr>
  <td>
  <p style="padding:0px 100px;">
  </p>
  </td>
  </tr>
  <tr>
  <td>
  <a href="${link}" style="margin:10px 0px 30px 0px;border-radius:4px;padding:10px 20px;border: 0;color:#fff;background-color:#630E2B; ">Verify Email address</a>
  </td>
  </tr>
  <br>
  <br>
  <br>
  <br>
  <br>
  <br>
  <br>
  <br>
  <tr>
  <td>
  <a href="${reLink}" style="margin:10px 0px 30px 0px;border-radius:4px;padding:10px 20px;border: 0;color:#fff;background-color:#630E2B; ">Request New Email</a>
  </td>
  </tr>
  </table>
  </td>
  </tr>
  <tr>
  <td>
  <table border="0" width="100%" style="border-radius: 5px;text-align: center;">
  <tr>
  <td>
  <h3 style="margin-top:10px; color:#000">Stay in touch</h3>
  </td>
  </tr>
  <tr>
  <td>
  <div style="margin-top:20px;">
  
  <a href="${process.env.facebookLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
  <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35062_erj5dx.png" width="50px" hight="50px"></span></a>
  
  <a href="${process.env.instagram}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
  <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35063_zottpo.png" width="50px" hight="50px"></span>
  </a>
  
  <a href="${process.env.twitterLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;;color:#fff;border-radius:50%;">
  <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group_35064_i8qtfd.png" width="50px" hight="50px"></span>
  </a>
  
  </div>
  </td>
  </tr>
  </table>
  </td>
  </tr>
  </table>
  </body>
  </html>`;
  if (!(await sendEmail({ to: email, subject: "Confirm Email", html }))) {
    return next(new Error("Email Rejected", { cause: 400 }));
  }

  // hash password

  const hashPassword = hash({ plaintext: password });

  // create user

  const { _id } = await userModel.create({
    userName,
    email,
    password: hashPassword,
  });
  return res.status(201).json({ message: "Done", _id });
});
export const confirmEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { email } = verifyToken({ token, signature: process.env.EMAIL_TOKEN });
  if (!email) {
    return next(new Error("Invalid token payload", { cause: 400 }));
  }
  const user = await userModel.updateOne({ email:email.toLowerCase() }, { confirmEmail: true });

  if (user.matchedCount) {
    return res.status(200).redirect(`${process.env.FE_URL}/#/login`);
  } else {
    res.status(200).redirect(`${process.env.FE_URL}/#/NotRegisterAccount`);
  }
});
export const newRequestConfirmEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { email } = verifyToken({ token, signature: process.env.EMAIL_TOKEN });
  if (!email) {
    return next(new Error("Invalid token payload", { cause: 400 }));
  }
  const user = await userModel.findOne({ email:email.toLowerCase() });
  if (!user) {
    return next(new Error("No Register Email", { cause: 404 }));
  }
  if (user.confirmEmail) {
    return res.status(200).redirect(`${process.env.FE_URL}/#/login`);
  }
  const newToken = generateToken({
    payload: { email },
    signature: process.env.EMAIL_TOKEN,
    expiresIn: 60 * 2,
  });

  const link = ` ${req.protocol}://${req.headers.host}/auth/confirmEmail/${newToken}`;
  const reLink = `${req.protocol}://${req.headers.host}/auth/newConfirmEmail/${token}`;

  const html = `<!DOCTYPE html>
  <html>
  <head>
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"></head>
  <style type="text/css">
  body{background-color: #88BDBF;margin: 0px;}
  </style>
  <body style="margin:0px;"> 
  <table border="0" width="50%" style="margin:auto;padding:30px;background-color: #F3F3F3;border:1px solid #630E2B;">
  <tr>
  <td>
  <table border="0" width="100%">
  <tr>
  <td>
  <h1>
      <img width="100px" src="https://res.cloudinary.com/ddajommsw/image/upload/v1670702280/Group_35052_icaysu.png"/>
  </h1>
  </td>
  <td>
  <p style="text-align: right;"><a href="http://localhost:4200/#/" target="_blank" style="text-decoration: none;">View In Website</a></p>
  </td>
  </tr>
  </table>
  </td>
  </tr>
  <tr>
  <td>
  <table border="0" cellpadding="0" cellspacing="0" style="text-align:center;width:100%;background-color: #fff;">
  <tr>
  <td style="background-color:#630E2B;height:100px;font-size:50px;color:#fff;">
  <img width="50px" height="50px" src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703716/Screenshot_1100_yne3vo.png">
  </td>
  </tr>
  <tr>
  <td>
  <h1 style="padding-top:25px; color:#630E2B">Email Confirmation</h1>
  </td>
  </tr>
  <tr>
  <td>
  <p style="padding:0px 100px;">
  </p>
  </td>
  </tr>
  <tr>
  <td>
  <a href="${link}" style="margin:10px 0px 30px 0px;border-radius:4px;padding:10px 20px;border: 0;color:#fff;background-color:#630E2B; ">Verify Email address</a>
  </td>
  </tr>
  <br>
  <br>
  <br>
  <br>
  <br>
  <br>
  <br>
  <br>
  <tr>
  <td>
  <a href="${reLink}" style="margin:10px 0px 30px 0px;border-radius:4px;padding:10px 20px;border: 0;color:#fff;background-color:#630E2B; ">Request New Email</a>
  </td>
  </tr>
  </table>
  </td>
  </tr>
  <tr>
  <td>
  <table border="0" width="100%" style="border-radius: 5px;text-align: center;">
  <tr>
  <td>
  <h3 style="margin-top:10px; color:#000">Stay in touch</h3>
  </td>
  </tr>
  <tr>
  <td>
  <div style="margin-top:20px;">
  
  <a href="${process.env.facebookLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
  <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35062_erj5dx.png" width="50px" hight="50px"></span></a>
  
  <a href="${process.env.instagram}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
  <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35063_zottpo.png" width="50px" hight="50px"></span>
  </a>
  
  <a href="${process.env.twitterLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;;color:#fff;border-radius:50%;">
  <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group_35064_i8qtfd.png" width="50px" hight="50px"></span>
  </a>
  
  </div>
  </td>
  </tr>
  </table>
  </td>
  </tr>
  </table>
  </body>
  </html>`;
  if (!(await sendEmail({ to: email, subject: "Confirm Email", html }))) {
    return next(new Error("Email Rejected", { cause: 400 }));
  }
  return res.status(200).send("<p>Confirm New Email Plz</p>");
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // check if user already exists

  const user = await userModel.findOne({email:email.toLowerCase() });
  if (!user) {
    return next(new Error("Not Registered Account", { cause: 404 }));
  }
  if (!user.confirmEmail) {
    return next(new Error("plz confirm ur email", { cause: 400 }));
  }
  if (!compare({ plaintext: password, hashValue: user.password })) {
    return next(new Error("In-Valid Login Data", { cause: 404 }));
  }

  const accessToken = generateToken({
    payload: { id: user._id, role: user.role },
    expiresIn: 30 * 60,
  });
  const refreshToken = generateToken({
    payload: { id: user._id, role: user.role },
    expiresIn: 30 * 60 * 24 * 365,
  });
  user.status = "online";
  await user.save();
  return res.status(200).json({ message: "Done", accessToken, refreshToken });
});

export const sendCode = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  //const forgetCode = Math.floor(Math.random() * (9999 - 1000 + 1) - 1000);
  const nanoId = customAlphabet("0123456789", 4);

  const forgetCode = nanoId();

  const user = await userModel.findOneAndUpdate({ email:email.toLowerCase() }, { forgetCode });
  if (!user) {
    return next(new Error("No Email Registered", { cause: 404 }));
  }
  const html = `<!DOCTYPE html>
  <html>
  <head>
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"></head>
  <style type="text/css">
  body{background-color: #88BDBF;margin: 0px;}
  </style>
  <body style="margin:0px;"> 
  <table border="0" width="50%" style="margin:auto;padding:30px;background-color: #F3F3F3;border:1px solid #630E2B;">
  <tr>
  <td>
  <table border="0" width="100%">
  <tr>
  <td>
  <h1>
      <img width="100px" src="https://res.cloudinary.com/ddajommsw/image/upload/v1670702280/Group_35052_icaysu.png"/>
  </h1>
  </td>
  <td>
  <p style="text-align: right;"><a href="http://localhost:4200/#/" target="_blank" style="text-decoration: none;">View In Website</a></p>
  </td>
  </tr>
  </table>
  </td>
  </tr>
  <tr>
  <td>
  <table border="0" cellpadding="0" cellspacing="0" style="text-align:center;width:100%;background-color: #fff;">
  <tr>
  <td style="background-color:#630E2B;height:100px;font-size:50px;color:#fff;">
  <img width="50px" height="50px" src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703716/Screenshot_1100_yne3vo.png">
  </td>
  </tr>
  <tr>
  <td>
  <h1 style="padding-top:25px; color:#630E2B">Reset Password</h1>
  </td>
  </tr>
  <tr>
  <td>
  <p style="padding:0px 100px;">
  </p>
  </td>
  </tr>
  <tr>
  <td>
  <p  style="margin:10px 0px 30px 0px;border-radius:4px;padding:10px 20px;border: 0;color:#fff;background-color:#630E2B; ">${forgetCode}</p>
  </td>
  
  </table>
  </td>
  </tr>
  <tr>
  <td>
  <table border="0" width="100%" style="border-radius: 5px;text-align: center;">
  <tr>
  <td>
  <h3 style="margin-top:10px; color:#000">Stay in touch</h3>
  </td>
  </tr>
  <tr>
  <td>
  <div style="margin-top:20px;">
  
  <a href="${process.env.facebookLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
  <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35062_erj5dx.png" width="50px" hight="50px"></span></a>
  
  <a href="${process.env.instagram}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
  <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35063_zottpo.png" width="50px" hight="50px"></span>
  </a>
  
  <a href="${process.env.twitterLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;;color:#fff;border-radius:50%;">
  <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group_35064_i8qtfd.png" width="50px" hight="50px"></span>
  </a>
  
  </div>
  </td>
  </tr>
  </table>
  </td>
  </tr>
  </table>
  </body>
  </html>`;
  if (!(await sendEmail({ to: email, subject: "Confirm Email", html }))) {
    return next(new Error("Email Rejected", { cause: 400 }));
  }

  return res.status(200).json({ message: "Done" });
});
export const forgetPassword = async (req, res, next) => {
  const { email, forgetCode, password } = req.body;

  const user = await userModel.findOne({ email:email.toLowerCase() });
  if (!user) {
    return next(new Error("No Email Registered", { cause: 404 }));
  }
  if (user.forgetCode != forgetCode) {
    return next(new Error("error in reset password", { cause: 400 }));
  }
  user.password = hash({ plaintext: password });
  user.forgetCode = null;
  user.changePasswordTime = Date.now(); 
  await user.save();

  return res.status(200).json({ message: "done" });
};
