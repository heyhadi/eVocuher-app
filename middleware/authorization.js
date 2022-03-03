const { User } = require("../models/index");

async function authorization(req, res, next) {
    console.log(req.loggedInUser);
    const { id_user } = req.params;
    // console.log(id_user);
    try {
        // console.log(id);
        let user = await User.findOne({
            where: {
                id: +id_user,
            },
        });
        //   console.log(user);
        if (!user || req.loggedInUser.id !== user.id) {
            res.status(401).json("not authorized");
        } else {
            next();
        }
    } catch (error) {
        res.status(500).json(error.message);
    }
}
module.exports = authorization;
