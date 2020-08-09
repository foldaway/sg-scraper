import {
  Model,
  Sequelize,
  DataTypes,
  BelongsToCreateAssociationMixin,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  Association,
} from 'sequelize';
import Bank from './Bank';
import { Point } from 'geojson';

export default class BankATM extends Model {
  public id!: number;
  public createdAt!: Date;
  public updatedAt!: Date;

  public title!: string;
  public address!: string;
  public opening_hours!: string;
  public location!: Point;

  public createBank!: BelongsToCreateAssociationMixin<Bank>;
  public getBank!: BelongsToGetAssociationMixin<Bank>;
  public setBank!: BelongsToSetAssociationMixin<Bank, number>;

  public readonly Bank?: Bank;

  public static associations: {
    Bank: Association<BankATM, Bank>;
  };

  public static initialize(sequelize: Sequelize): void {
    this.init(
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
          allowNull: true,
        },
        location: {
          type: DataTypes.GEOMETRY('POINT'),
          allowNull: true,
        },
        bank_id: {
          type: DataTypes.INTEGER,
          references: {
            model: 'banks',
            key: 'id',
          },
        },
      },
      {
        underscored: true,
        sequelize,
        tableName: 'bank_atms',
      }
    );
  }
}
