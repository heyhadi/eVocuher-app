const voucher_codes = require("voucher-code-generator");

function generateVoucher(length)  {
    return voucher_codes.generate({
        length: 10,
        count: length,
        format: "alphanumeric",
    })
};

module.exports = {generateVoucher}