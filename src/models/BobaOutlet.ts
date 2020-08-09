import {
  Model,
  Sequelize,
  DataTypes,
  BelongsToCreateAssociationMixin,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  Association,
} from 'sequelize';
import BobaChain from './BobaChain';

export default class BobaOutlet extends Model {
  public id!: number;
  public createdAt!: Date;
  public updatedAt!: Date;

  public title!: string;
  public address!: string;
  public opening_hours!: string;
  public location!: string;

  public createBobaChain!: BelongsToCreateAssociationMixin<BobaChain>;
  public getBobaChain!: BelongsToGetAssociationMixin<BobaChain>;
  public setBobaChain!: BelongsToSetAssociationMixin<BobaChain, number>;

  public readonly chain?: BobaChain;

  public static associations: {
    chain: Association<BobaOutlet, BobaChain>;
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
          unique: true,
        },
        opening_hours: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        location: {
          type: DataTypes.GEOMETRY('POINT'),
          allowNull: true,
        },
        boba_chain_id: {
          type: DataTypes.INTEGER,
          references: {
            model: 'boba_chains',
            key: 'id',
          },
        },
      },
      {
        underscored: true,
        tableName: 'boba_outlets',
        sequelize,
      }
    );
  }
}
