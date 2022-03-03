'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Order.init({
    name: DataTypes.STRING,
    phone_number: DataTypes.STRING,
    id_product: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    flag_paid: DataTypes.STRING,
    price_pcs: DataTypes.INTEGER,
    total_amount: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Order',
  });
  return Order;
};