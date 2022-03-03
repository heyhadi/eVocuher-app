const { User, Voucher, Order, voucher_code, sequelize } = require("../models/index");
const { hashPass, comparePass } = require("../helpers/bcrypt");
const { loginToken, refreshToken, verifyRefresh } = require("../helpers/jwt");
const { Op } = require("sequelize");
const stripe_key = process.env.STRIPE_KEY;
const stripe = require("stripe")(stripe_key);
const { generateVoucher } = require("../helpers/voucherGenerator");

const register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const checkEmail = await User.findOne({
            where: { email },
            raw: true,
        });

        if (!checkEmail) {
            const hashedPass = hashPass(password);
            console.log(hashedPass);
            const obj = {
                name,
                email,
                password: hashedPass,
                is_admin: "N",
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

//get list of voucher that is still active
const getVoucherList = async (req, res) => {
    try {
        const voucherList = await sequelize.query(
            `SELECT 
                id, title, amount, price, image, expiry_date 
                FROM public."Vouchers" WHERE expiry_date >= NOW()`
        );

        res.status(200).json({
            success: true,
            message: "Your voucher list is here",
            voucherList: voucherList[0],
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

//function to get voucher details
const getVoucherDetail = async (req, res) => {
    const { id_voucher } = req.params;
    try {
        const voucherList = await Voucher.findOne({
            where: { id: id_voucher },
            raw: true,
        });

        res.status(200).json({
            success: true,
            message: "Your voucher detail is here",
            voucherList,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

//function to do a checkout
const checkout = async (req, res) => {
    const { id_user } = req.params;
    const { id_product, name, phone_number, quantity } = req.body;

    // console.log(req.body);

    try {
        const voucher_detail = await Voucher.findOne({
            where: { id: +id_product },
        });

        const obj_order = {
            id_product,
            name,
            phone_number,
            quantity,
            flag_paid: "N",
            price_pcs: voucher_detail.price,
            total_amount: quantity * voucher_detail.price,
        };
        // console.log(obj_order, "kk");

        const vouchers = await Voucher.findOne({ where: { id: id_product } });

        if (vouchers.buy_type == "1" && quantity > vouchers.max_buy) {
            throw {
                status: 400,
                message: `This voucher category is ONLY ME USAGE, You can only buy this  ${vouchers.max_buy}  pcs maximum`,
            };
        } else if (vouchers.buy_type == "2" && quantity > vouchers.max_buy) {
            throw {
                status: 400,
                message: `This voucher category is GIFT TO OTHERS, You can only buy this  ${vouchers.max_buy}  pcs maximum`,
            };
        }

        if (vouchers.quantity < quantity) {
            throw {
                status: 400,
                message: `Not enough stock`,
            };
        } else {
            const create_order = await Order.create(obj_order);
            res.status(200).json({
                success: true,
                message: "Your order has been placed",
                order: create_order,
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

//function to make payment with card
const payment = async (req, res) => {
    const { email, id_order } = req.body;
    const { cardNumber, cardExpMonth, cardExpYear, cardCVC, country, postalCode } = req.body;

    if (!cardNumber || !cardExpMonth || !cardExpYear || !cardCVC) {
        return res.status(400).send({
            Error: "Necessary Card Details are required for One Time Payment",
        });
    }
    try {
        const t = await sequelize.transaction(async (t) => {
            const order_detail = await Order.findOne(
                {
                    where: { id: id_order },
                },
                { lock: true, transaction: t }
            );
            const vouchers = await Voucher.findOne({ where: { id: order_detail.id_product } }, { lock: true, transaction: t });
            if (vouchers.quantity < order_detail.quantity) {
                throw {
                    status: 400,
                    message: `Not enough stock`,
                };
            } else {
                const cardToken = await stripe.tokens.create({
                    card: {
                        number: cardNumber,
                        exp_month: cardExpMonth,
                        exp_year: cardExpYear,
                        cvc: cardCVC,
                        address_state: country,
                        address_zip: postalCode,
                    },
                });

                const charge = await stripe.charges.create({
                    amount: order_detail.total_amount * 100,
                    currency: "usd",
                    source: cardToken.id,
                    receipt_email: email,
                    description: `Stripe Charge Of Amount ${order_detail.total_amount} for One Time Payment`,
                });
                if (charge.status === "succeeded") {
                    vouchers.quantity = vouchers.quantity - order_detail.quantity;
                    order_detail.flag_paid = "Y";
                    const generate_code = generateVoucher(+order_detail.quantity);

                    generate_code.map(async (e) => {
                        const create_code = await voucher_code.create({
                            id_voucher: order_detail.id_product,
                            phone_number: order_detail.phone_number,
                            code: e,
                            isUsed: "N",
                        });
                    });
                    await vouchers.save({ transaction: t });
                    await order_detail.save({ transaction: t });
                    res.status(200).send({ Success: charge, order_detail });
                } else {
                    res.status(400).send({ Error: "Please try again later for One Time Payment" });
                }
            }
        });
    } catch (error) {
        res.status(400).send({
            Error: error,
        });
    }
};

//function to verify voucher code status
const verifyVoucher = async (req, res) => {
    const { code, phone_number } = req.body;
    const { id_user } = req.params;
    try {
        const voucher_detail = await sequelize.query(
            `SELECT 
                voucher.id, 
                voucher.title, 
                voucher.amount, 
                voucher.price, 
                voucher.image, 
                voucher.expiry_date,
                code."isUsed"
            FROM public."Vouchers" voucher
            left join public.voucher_codes code on code.id_voucher = voucher.id
                WHERE code.code = '${code}'
                AND code.phone_number = '${phone_number}' 
                AND code."isUsed" = 'N'
                AND voucher.expiry_date >= NOW()`
        );

        let status;
        if (voucher_detail[0].length > 0) {
            status = "active";
        } else {
            status = "expired";
        }

        res.status(200).json({
            success: true,
            message: `Your voucher with code '${code}' is ${status}`,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

//function to redeem the voucher
const redeemVoucher = async (req, res) => {
    const { code, phone_number } = req.body;
    const { id_user } = req.params;
    try {
        const voucher_detail = await sequelize.query(
            `SELECT 
                voucher.id, 
                voucher.title, 
                voucher.amount, 
                voucher.price, 
                voucher.image, 
                voucher.expiry_date,
                code."isUsed"
            FROM public."Vouchers" voucher
            left join public.voucher_codes code on code.id_voucher = voucher.id
                WHERE code.code = '${code}'
                AND code.phone_number = '${phone_number}' 
                AND voucher.expiry_date >= NOW()`
        );

        if (voucher_detail[0].length > 0 && voucher_detail[0][0].isUsed === "N") {
            const voucher_redeem = await sequelize.query(
                `UPDATE public.voucher_codes
                SET "isUsed" = 'Y'
                WHERE code = '${code}'
                AND phone_number = '${phone_number}'`
            );

            res.status(200).json({
                success: true,
                message: `Your voucher with code '${code}' has been succesfully redeemed`,
            });
        } else {
            res.status(400).json({
                success: false,
                message: `Your voucher with code '${code}' has been redeemed or is expired`,
            });
        }
    } catch (error) {}
};

//order history
const orderHistory = async (req, res) => {
    const { id_user } = req.params;
    const { phone_number } = req.body;
    try {
        const unused_voucher = await voucher_code.findAll({
            where: {
                phone_number,
                isUsed: "N",
            },
            attributes: ["code"],
            order: [["createdAt", "DESC"]],
        });

        const used_voucher = await voucher_code.findAll({
            where: {
                phone_number,
                isUsed: "Y",
            },
            attributes: ["code"],
            order: [["createdAt", "DESC"]],
        });

        res.status(200).json({
            success: true,
            purchase_history: {
                unused_voucher,
                used_voucher,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    register,
    getVoucherList,
    getVoucherDetail,
    checkout,
    payment,
    verifyVoucher,
    redeemVoucher,
    orderHistory
};
