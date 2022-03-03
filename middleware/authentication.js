const { verifyToken } = require("../helpers/jwt");
const { User } = require("../models/index");

async function authentication(req, res, next) {
    try {
        const access_token = req.headers.access_token;
        if (!access_token) {
            res.status(401).json("Please Login first");
        } else {
            const decoded = verifyToken(access_token);
            const user = await User.findOne({
                where: {
                    email: decoded.email,
                },
            });
            if (!user) {
                throw { msg: "Authentication Failed", status: 401 };
            } else {
                req.loggedInUser = decoded;
                next();
            }
        }
    } catch (err) {
        res.status(err.status || 500).json({
            success: false,
            message: err.message,
        });
    }
}

module.exports = authentication;
