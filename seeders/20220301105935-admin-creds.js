'use strict';

const { hashPass } = require("../helpers/bcrypt");

let admin = [
  {
    name: 'admin',
    email: 'admin@mail.com',
    password: hashPass('12345678'),
    is_admin: 'Y',
    createdAt : new Date(),
    updatedAt : new Date()
  }
]

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await queryInterface.bulkInsert("Users", admin,{})
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("Users", null, {})
  }
};