'use strict';

import { Sequelize, Options, Dialect } from 'sequelize';

import config from '../config/config.json';
import ACCollectibleType from './ACCollectibleType';
import ACCollectible from './ACCollectible';
import Bank from './Bank';
import BankATM from './BankATM';
import BobaChain from './BobaChain';
import BobaOutlet from './BobaOutlet';

interface CustomOptions {
  use_env_variable: string;
}

let dbConfig: Options | CustomOptions;

switch (process.env.NODE_ENV) {
  case 'production': {
    dbConfig = config.production;
    break;
  }
  case 'test': {
    dbConfig = {
      ...config.test,
      dialect: config.test.dialect as Dialect,
    };
    break;
  }
  default: {
    dbConfig = {
      ...config.development,
      dialect: config.development.dialect as Dialect,
    };
    break;
  }
}

const isCustomOptions = (obj: any): obj is CustomOptions => {
  return typeof obj['use_env_variable'] === 'string';
};

let sequelize;
if (isCustomOptions(dbConfig)) {
  const envVarKey = dbConfig.use_env_variable;
  const connectURI = process.env[envVarKey];

  if (!connectURI) {
    throw new Error('Env var specified, but env var is undefined');
  }
  sequelize = new Sequelize(connectURI);
} else {
  sequelize = new Sequelize(dbConfig);
}

export default sequelize;

ACCollectibleType.initialize(sequelize);
ACCollectible.initialize(sequelize);
Bank.initialize(sequelize);
BankATM.initialize(sequelize);
BobaChain.initialize(sequelize);
BobaOutlet.initialize(sequelize);

ACCollectible.belongsTo(ACCollectibleType, {
  targetKey: 'id',
  foreignKey: 'type_id',
});
BankATM.belongsTo(Bank, { targetKey: 'id' });
Bank.hasMany(BankATM);
BobaOutlet.belongsTo(BobaChain, { targetKey: 'id' });
BobaChain.hasMany(BobaOutlet);

export {
  ACCollectible,
  ACCollectibleType,
  Bank,
  BankATM,
  BobaChain,
  BobaOutlet,
};
