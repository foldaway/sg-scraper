'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */

    await queryInterface.changeColumn('bank_atms', 'opening_hours', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    return queryInterface.changeColumn('boba_outlets', 'opening_hours', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */

    await queryInterface.changeColumn('bank_atms', 'opening_hours', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    return queryInterface.changeColumn('boba_outlets', 'opening_hours', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};
