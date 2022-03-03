const jwt = require("jsonwebtoken");
require("dotenv").config();

function loginToken(input) {
    const token = jwt.sign(input, process.env.SECRET, { expiresIn: "6h" });
    return token;
}

function refreshToken(input) {
    const refreshToken = jwt.sign(input, process.env.SECRET, {
        expiresIn: "30m",
    });
    return refreshToken;
}

function verifyToken(token) {
    const decoded = jwt.verify(token, process.env.SECRET);
    return decoded;
}

function verifyRefresh(email, refreshToken) {
    decoded = jwt.verify(refreshToken, process.env.SECRET);
    return decoded.email === email;
}


module.exports = {
    loginToken,
    verifyToken,
    refreshToken,
    verifyRefresh,
};
