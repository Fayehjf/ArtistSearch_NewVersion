const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { cookieOptions } = require("../utils/config");

const authenticateUser = async (req, res, next) => {
    const token = req.cookies?.token;

    if (!token){
        return res.status(401).json({ 
            success:false,
            error: "AUTH_REQUIRED",
            message: "Authentiation token is required"
        });
    } 

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.exp < Date.now() / 1000) {
            res.clearCookie("token", cookieOptions);
            return res.status(401).json({
                success: false,
                error: "TOKEN_EXPIRED",
                message: "Session expired, please login again"
            });
        }

        const user = await User.findById(decoded.userId)
            .select("-password")
            .lean();

        if (!user){
            res.clearCookie("token", cookieOptions);
            return res.status(401).json({
                success: false,
                error: "USER_NOT_FOUND",
                message: "The authenticated user no longer exists"
            });
        }

        req.user = {
            id: user._id.toString(),
            email: user.email,
            profile:{
                name:user.fullname,
                image: user.profileImageUrl
            },
            favorites: user.favorites,
            notifications: user.notifications
        };
        
        next();
    } catch (error) {
        res.clearCookie("token", cookieOptions);
    
        const response = {
            success: false,
            error: "AUTH_FAILED",
            message: "Authentication failed"
        };

        if (error.name === "TokenExpiredError") {
            response.error = "TOKEN_EXPIRED";
            response.message = "Session expired, please login again";
        } else if (error.name === "JsonWebTokenError") {
            response.error = "INVALID_TOKEN";
            response.message = "Invalid authentication token";
        }
        res.status(401).json(response);
    }
};

module.exports = authenticateUser;