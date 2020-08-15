import { Model, Sequelize, DataTypes } from 'sequelize';

export default class ACCollectibleType extends Model {
  public id!: number;
  public createdAt!: Date;
  public updatedAt!: Date;

  public name!: string;

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
        tableName: 'ac_collectible_types',
        sequelize,
      }
    );
  }
}
