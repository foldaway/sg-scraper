module.exports = (sequelize, DataTypes) => {
  const bobaOutlet = sequelize.define(
    'bobaOutlet',
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
  bobaOutlet.associate = function(models) {
    // associations can be defined here
    bobaOutlet.belongsTo(models.bobaChain);
  };
  return bobaOutlet;
};
