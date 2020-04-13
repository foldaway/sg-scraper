module.exports = (sequelize, DataTypes) => {
  const acCollectible = sequelize.define(
    'acCollectible',
    {
      name: { type: DataTypes.STRING, allowNull: false },
      location: { type: DataTypes.STRING, allowNull: false },
      sell_price: { type: DataTypes.INTEGER, allowNull: false },
      season: { type: DataTypes.STRING, allowNull: false },
      time: { type: DataTypes.STRING, allowNull: false },
    },
    {
      underscored: true,
    }
  );
  acCollectible.associate = function(models) {
    // associations can be defined here
    acCollectible.hasOne(models.acCollectibleType);
  };
  return acCollectible;
};
