module.exports = (sequelize, DataTypes) => {
  const bankATM = sequelize.define(
    'bankATM',
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      opening_hours: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      location: {
        type: DataTypes.GEOMETRY('POINT'),
        allowNull: false,
      },
    },
    {
      underscored: true,
    }
  );
  bankATM.associate = function(models) {
    // associations can be defined here
    bankATM.belongsTo(models.bank);
  };
  return bankATM;
};
