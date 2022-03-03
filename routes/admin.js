const router = require("express").Router();
const adminController  = require('../controllers/adminController')
const authentication = require('../middleware/authentication')
const authorization = require('../middleware/authorization')


router.post('/login', adminController.login)
router.post('/register', adminController.register)
router.use(authentication)
router.post('/create-voucher/:id_user', authorization, adminController.multerImg, adminController.createVoucher)
router.put('/update-voucher/:id_user/:id_voucher', authorization, adminController.multerImg, adminController.updateVoucher)
router.get('/get-voucher-list/:id_user', adminController.getVoucherList)


module.exports = router;