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
      return res.status(401).json({
        status: "failure",
        code: 401,
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
      return res.status(401).json({
        status: "failure",
        code: 401,
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
      return res.status(401).json({
        status: "failure",
        code: 401,
        msg: "User is not Logged In: Token corrupt",
        data: {
          isLoggedIn: false,
        },
      });
    }

    return res.status(401).json({
      status: "failure",
      code: 401,
      msg: "User is not Logged In: Token corrupt",
      data: {
        isLoggedIn: false,
      },
    });
  }
};

// Admin middleware - checks if user is admin
const adminMiddleware = async (req, res, next) => {
  try {
    const { userId } = req;
    
    if (!userId) {
      return res.status(401).json({
        status: "failure",
        code: 401,
        msg: "Authentication required"
      });
    }

    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({
        status: "failure",
        code: 404,
        msg: "User not found"
      });
    }

    if (!user.admin) {
      return res.status(403).json({
        status: "failure",
        code: 403,
        msg: "Admin access required"
      });
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({
      status: "failure",
      code: 500,
      msg: "Internal server error"
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
    adminMiddleware,
    // authAdmin,
    // notAdmin,
    // auth,
}