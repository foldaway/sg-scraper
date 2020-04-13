module.exports = (sequelize, DataTypes) => {
  const bobaOutlet = sequelize.define(
    'bobaOutlet',
    {
      title: DataTypes.STRING,
      address: DataTypes.STRING,
      opening_hours: DataTypes.STRING,
      location: DataTypes.GEOMETRY('POINT'),
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
