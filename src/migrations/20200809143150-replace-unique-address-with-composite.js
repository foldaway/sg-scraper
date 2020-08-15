'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.changeColumn('bank_atms', 'address', {
      type: Sequelize.STRING,
      unique: false,
    });

    await queryInterface.changeColumn('boba_outlets', 'address', {
      type: Sequelize.STRING,
      unique: false,
    });

    await queryInterface.addConstraint('bank_atms', {
      fields: ['address', 'bank_id'],
      type: 'unique',
      name: 'bank_atms_address_bank_id_uk',
    });

    await queryInterface.addConstraint('boba_outlets', {
      fields: ['address', 'boba_chain_id'],
      type: 'unique',
      name: 'boba_outlets_address_boba_chain_id_uk',
    });

    // Apparently sequelize can't do this automatically through the first two await calls
    await queryInterface.removeConstraint('bank_atms', 'bank_atms_address_key');
    await queryInterface.removeConstraint(
      'boba_outlets',
      'boba_outlets_address_key'
    );
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.changeColumn('bank_atms', 'address', {
      type: Sequelize.STRING,
      unique: true,
    });

    await queryInterface.changeColumn('boba_outlets', 'address', {
      type: Sequelize.STRING,
      unique: true,
    });

    await queryInterface.removeConstraint(
      'bank_atms',
      'bank_atms_address_bank_id_uk'
    );

    return queryInterface.removeConstraint(
      'boba_outlets',
      'boba_outlets_address_boba_chain_id_uk'
    );
  },
};
