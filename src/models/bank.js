module.exports = (sequelize, DataTypes) => {
  const bank = sequelize.define(
    'bank',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      underscored: true,
    }
  );
  bank.associate = function(models) {
    // associations can be defined here
  };
  return bank;
};
