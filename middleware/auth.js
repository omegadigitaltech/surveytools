


const jwt = require('jsonwebtoken')
const jwtSecret = process.env.JWT_SECRET
const User = require("../model/user")
// const noLayout = '../views/layouts/nothing.ejs'


// const authMiddleware = async (req, res, next ) => {
//   try {
    
//     req.session.referer = req.originalUrl
//     const token = req.cookies.token;
  
//     if(!token) {
//       return res.status(404).json({
//         status: "failure",
//         code: 404,
//         msg: "User is not Logged In: Token not found",
//         data: {
//           isLoggedIn: false,
//         }
//     })
//     }
      
//     const decoded = jwt.verify(token, jwtSecret);
//     //dont just find by Id, but by password
//     const user = await User.findOne({id: decoded.userId})
//     if(!user) {
//       return res.status(404).json({
//         status: "failure",
//         code: 404,
//         msg: "User is not Logged In: Token corrupt",
//         data: {
//           isLoggedIn: false,
//         }
//       })
//     }
//     req.userId = decoded.userId;
//     next();
//   } catch(error) {
//     console.log(error)
//     req.session.referer = req.originalUrl
//     if(error instanceof jwt.JsonWebTokenError){
//       res.clearCookie('token');
//       return res.status(404).json({
//         status: "failure",
//         code: 404,
//         msg: "User is not Logged In: Token corrupt",
//         data: {
//           isLoggedIn: false,
//         }
//     })
//     }
//     return res.status(404).json({
//       status: "failure",
//       code: 404,
//       msg: "User is not Logged In: Token corrupt",
//       data: {
//         isLoggedIn: false,
//       }
//   })
//   }

//   }


const authMiddleware = async (req, res, next) => {
  try {
    req.session.referer = req.originalUrl;

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(404).json({
        status: "failure",
        code: 404,
        msg: "User is not Logged In: Token not found",
        data: {
          isLoggedIn: false,
        },
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, jwtSecret);

    // Find the user by id and optionally include password verification if needed
    const user = await User.findOne({ id: decoded.userId });
    if (!user) {
      return res.status(404).json({
        status: "failure",
        code: 404,
        msg: "User is not Logged In: Token corrupt",
        data: {
          isLoggedIn: false,
        },
      });
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.log(error);
    req.session.referer = req.originalUrl;

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(404).json({
        status: "failure",
        code: 404,
        msg: "User is not Logged In: Token corrupt",
        data: {
          isLoggedIn: false,
        },
      });
    }

    return res.status(404).json({
      status: "failure",
      code: 404,
      msg: "User is not Logged In: Token corrupt",
      data: {
        isLoggedIn: false,
      },
    });
  }
};




// Check if they are admin and if so grant them access
// const authAdmin = async (req, res, next) => {
//   const user = await User.findById(req.userId)
//   if(!user) {
//     return res.render("admin/error-500", {layout: noLayout, name: "Not Found",statusCode: 404, message: "No User Found"})
//   }

//   let check_admin = user.admin
//   if(check_admin == true) {
//     next()
//   } else {
//     return res.render("admin/error-500", {layout: noLayout, name: "Unauthorized",statusCode: 401, message: "You are not allowed to access this page, contact ADMIN "})
//   }
// }

// const notAdmin = async (req, res, next) => {
//   const user = await User.findById(req.userId)
//   if(!user) {
//     return res.render("admin/error-500", {layout: noLayout, name: "Not Found",statusCode: 404, message: "No User Found"})
//   }

//   let check_admin = user.admin
//   if(check_admin == false) {
//     next()
//   } else {
//     return res.render("admin/error-500", {layout: noLayout, name: "Unauthorized",statusCode: 401, message: "Admin is not allowed to perform this action"})
//   }
// }

module.exports = {
    authMiddleware,
    // authAdmin,
    // notAdmin,
    // auth,
}