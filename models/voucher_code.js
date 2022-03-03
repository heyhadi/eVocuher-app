'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class voucher_code extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  voucher_code.init({
    id_voucher: DataTypes.INTEGER,
    phone_number: DataTypes.STRING,
    code: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'voucher_code',
  });
  return voucher_code;
};