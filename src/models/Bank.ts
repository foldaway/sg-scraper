import {
  Model,
  Sequelize,
  DataTypes,
  HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyHasAssociationMixin,
  HasManyHasAssociationsMixin,
  HasManySetAssociationsMixin,
  HasManyRemoveAssociationsMixin,
  HasManyRemoveAssociationMixin,
  Association,
} from 'sequelize';
import BankATM from './BankATM';

export default class Bank extends Model {
  public id!: number;
  public createdAt!: Date;
  public updatedAt!: Date;

  public name!: string;

  public addBankATM!: HasManyAddAssociationMixin<BankATM, number>;
  public addBankATMs!: HasManyAddAssociationsMixin<BankATM, number>;
  public countBankATMs!: HasManyCountAssociationsMixin;
  public createBankATM!: HasManyCreateAssociationMixin<BankATM>;
  public getBankATMs!: HasManyGetAssociationsMixin<BankATM>;
  public hasBankATM!: HasManyHasAssociationMixin<BankATM, number>;
  public hasBankATMs!: HasManyHasAssociationsMixin<BankATM, number>;
  public removeBankATM!: HasManyRemoveAssociationMixin<BankATM, number>;
  public removeBankATMs!: HasManyRemoveAssociationsMixin<BankATM, number>;
  public setBankATMs!: HasManySetAssociationsMixin<BankATM, number>;

  public readonly atms?: BankATM[];

  public static associations: {
    atms: Association<Bank, BankATM>;
  };

  public static initialize(sequelize: Sequelize): void {
    this.init(
      {
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        underscored: true,
        tableName: 'banks',
        sequelize,
      }
    );
  }
}
