module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('boba_outlets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING,
      },
      address: {
        type: Sequelize.STRING,
      },
      opening_hours: {
        type: Sequelize.STRING,
      },
      location: {
        type: Sequelize.GEOMETRY('POINT'),
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('boba_outlets');
  },
};
