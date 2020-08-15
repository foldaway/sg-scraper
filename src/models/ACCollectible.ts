import {
  Model,
  Sequelize,
  DataTypes,
  Association,
  HasOneGetAssociationMixin,
  HasOneSetAssociationMixin,
} from 'sequelize';
import ACCollectibleType from './ACCollectibleType';

export default class ACCollectible extends Model {
  public id!: number;
  public createdAt!: Date;
  public updatedAt!: Date;

  public name!: string;
  public location!: string;
  public sell_price!: number;
  public season!: string;
  public time!: string;

  public type_id!: number;

  public readonly Type?: ACCollectibleType;

  public getACCollectibleType!: HasOneGetAssociationMixin<ACCollectibleType>;
  public setACCollectibleType!: HasOneSetAssociationMixin<
    ACCollectibleType,
    number
  >;

  public static associations: {
    Type: Association<ACCollectible, ACCollectibleType>;
  };

  public static initialize(sequelize: Sequelize): void {
    this.init(
      {
        name: { type: DataTypes.STRING, allowNull: false, unique: true },
        location: { type: DataTypes.STRING, allowNull: false },
        sell_price: { type: DataTypes.INTEGER, allowNull: false },
        season: { type: DataTypes.STRING, allowNull: false },
        time: { type: DataTypes.STRING, allowNull: false },
        type_id: {
          type: DataTypes.INTEGER,
          references: {
            model: 'ac_collectible_types',
            key: 'id',
          },
        },
      },
      {
        underscored: true,
        tableName: 'ac_collectibles',
        sequelize,
      }
    );
  }
}
