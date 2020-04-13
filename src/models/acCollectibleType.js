module.exports = (sequelize, DataTypes) => {
  const acCollectibleType = sequelize.define(
    'acCollectibleType',
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
  acCollectibleType.associate = function(models) {
    // associations can be defined here
  };
  return acCollectibleType;
};
