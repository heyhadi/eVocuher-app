const { User, Voucher } = require("../models/index");
const cloudinary = require("../config/cloudinaryConfig");
const { hashPass, comparePass } = require("../helpers/bcrypt");
const { loginToken, refreshToken, verifyRefresh } = require("../helpers/jwt");
const multer = require("multer");
const { Readable } = require("stream");
const multerSingle = multer();


const register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const checkEmail = await User.findOne({
            where: { email },
            raw: true,
        });

        if (!checkEmail ) {
            const hashedPass = hashPass(password);
            console.log(hashedPass);
            const obj = {
                name,
                email,
                password: hashedPass,
                is_admin: "Y"
            };
            const createUser = await User.create(obj);
            //   console.log(createUser);

            res.status(200).json({
                success: true,
                message: "Your registration was successfull",
            });
        } else {
            res.status(400).json({
                success: true,
                message: "Your email / username has already been registered",
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
//END Register

//Login FUnction
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const checkAccount = await User.findOne({
            where: { email },
            raw: true,
        });

        if (!checkAccount) {
            res.status(404).json({
                success: true,
                message: "You have no account",
            });
        } else {
            const checkPass = comparePass(password, checkAccount.password);
            if (checkPass) {
                const token = loginToken({
                    id: checkAccount.id,
                    email: checkAccount.email,
                });

                const refresh_token = refreshToken({
                    id: checkAccount.id,
                    email: checkAccount.email,
                });

                res.status(200).json({ succes: true, access_token: token, refresh_token });
            } else {
                res.status(400).json({
                    success: false,
                    message: "Wrong email or password",
                });
            }
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


//Refresh token function
const refresh_token = (req, res) => {
    const { email, refreshToken } = req.body;
    try {
        const isValid = verifyRefresh(email, refreshToken);
        if (!isValid) {
            return res.status(401).json({ success: false, error: "Invalid token,try login again" });
        }

        const acces_token = loginToken({ email });
        res.status(200).json({ succes: true, acces_token});
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


//upload photo to cloudinary
const bufferUpload = async (buffer) => {
    return new Promise((resolve, reject) => {
        const writeStream = cloudinary.uploader.upload_stream((err, result) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(result);
        });
        const readStream = new Readable({
            read() {
                this.push(buffer);
                this.push(null);
            },
        });
        readStream.pipe(writeStream);
    });
};

const multerImg = multerSingle.single("image");


//Function create voucher
const createVoucher = async (req, res) => {
    const { id_user } = req.params;
    try {
        const { buffer } = req.file;
        // console.log(buffer, 'kk');
        const { secure_url } = await bufferUpload(buffer);
        const create_voucher = await Voucher.create({
            ...req.body,
            // voucher_code: voucherCode,
            status: "Y",
            image: secure_url,
        });

        // console.log(create_course.dataValues);

        res.status(200).json({
            success: true,
            message: "Successfully create voucher",
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};


//function get list of voucher
const getVoucherList = async (req, res) => {
    try {
        const dataVoucher= await Voucher.findAll({
            raw: true,
        });

        res.status(200).json({
            success: true,
            data: dataVoucher
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


//function update voucher by id_voucher
const updateVoucher = async (req, res) => {
    const { id_user, id_voucher } = req.params;
    const { buffer } = req.file;

    try {
        const { secure_url } = await bufferUpload(buffer);
        const updateVoucher = await Voucher.update(
            {
                ...req.body,
                image: secure_url
            },
            {
                where: { id:id_voucher },
            }
        );
        res.status(200).json({
            success: true,
            message: "Successfully updated voucher",
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

module.exports = {
    multerImg,
    createVoucher,
    getVoucherList,
    updateVoucher,
    login,
    register,
    refresh_token,
};
