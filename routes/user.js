const router = require("express").Router();
const userController  = require('../controllers/userController')
const adminController  = require('../controllers/adminController')
const authentication = require('../middleware/authentication')
const authorization = require('../middleware/authorization')


router.post('/register', userController.register)
router.post('/login', adminController.login)
router.get('/get-all-voucher', userController.getVoucherList)
router.get('/get-voucher-detail/:id_voucher', userController.getVoucherDetail)
router.use(authentication)
router.post('/refresh-token', authorization, adminController.refresh_token)
router.post('/checkout/:id_user', authorization, userController.checkout)
router.post('/create-payment/:id_user', authorization, userController.payment)
router.post('/verify-voucher/:id_user', authorization, userController.verifyVoucher)
router.post('/redeem-voucher/:id_user', authorization, userController.redeemVoucher)
router.post('/purchase-history/:id_user', authorization, userController.orderHistory)




module.exports = router