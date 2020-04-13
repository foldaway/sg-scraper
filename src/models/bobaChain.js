module.exports = (sequelize, DataTypes) => {
  const bobaChain = sequelize.define(
    'bobaChain',
    {
      name: DataTypes.STRING,
      allowNull: false,
    },
    {
      underscored: true,
    }
  );
  bobaChain.associate = function(models) {
    // associations can be defined here
  };
  return bobaChain;
};
