module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('bank_atms', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      opening_hours: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      location: {
        type: Sequelize.GEOMETRY('POINT'),
        allowNull: false,
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
    return queryInterface.dropTable('bankATMs');
  },
};
