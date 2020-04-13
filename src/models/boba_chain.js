'use strict';
module.exports = (sequelize, DataTypes) => {
  const boba_chain = sequelize.define('boba_chain', {
    name: DataTypes.STRING
  }, {
    underscored: true,
  });
  boba_chain.associate = function(models) {
    // associations can be defined here
  };
  return boba_chain;
};