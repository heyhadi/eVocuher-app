'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Voucher extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Voucher.init({
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    expiry_date: DataTypes.DATE,
    image: DataTypes.STRING,
    amount: DataTypes.INTEGER,
    price: DataTypes.INTEGER,
    payment_method: DataTypes.INTEGER,
    discount: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    buy_type: DataTypes.STRING,
    max_buy: DataTypes.INTEGER,
    max_gift: DataTypes.INTEGER,
    status: DataTypes.STRING,
    voucher_code: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Voucher',
  });
  return Voucher;
};