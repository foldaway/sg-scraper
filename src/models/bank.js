'use strict';
module.exports = (sequelize, DataTypes) => {
  const bank = sequelize.define('bank', {
    name: DataTypes.STRING
  }, {
    underscored: true,
  });
  bank.associate = function(models) {
    // associations can be defined here
  };
  return bank;
};