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
  HasManyRemoveAssociationMixin,
  HasManyRemoveAssociationsMixin,
  HasManySetAssociationsMixin,
  Association,
} from 'sequelize';
import BobaOutlet from './BobaOutlet';

export default class BobaChain extends Model {
  public id!: number;
  public createdAt!: Date;
  public updatedAt!: Date;

  public name!: string;

  public addBobaOutlet!: HasManyAddAssociationMixin<BobaOutlet, number>;
  public addBobaOutlets!: HasManyAddAssociationsMixin<BobaOutlet, number>;
  public countBobaOutlets!: HasManyCountAssociationsMixin;
  public createBobaOutlet!: HasManyCreateAssociationMixin<BobaOutlet>;
  public getBobaOutlets!: HasManyGetAssociationsMixin<BobaOutlet>;
  public hasBobaOutlet!: HasManyHasAssociationMixin<BobaOutlet, number>;
  public hasBobaOutlets!: HasManyHasAssociationsMixin<BobaOutlet, number>;
  public removeBobaOutlet!: HasManyRemoveAssociationMixin<BobaOutlet, number>;
  public removeBobaOutlets!: HasManyRemoveAssociationsMixin<BobaOutlet, number>;
  public setBobaOutlets!: HasManySetAssociationsMixin<BobaOutlet, number>;

  public readonly outlets?: BobaOutlet[];

  public static associations: {
    outlets: Association<BobaChain, BobaOutlet>;
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
        tableName: 'boba_chains',
        sequelize,
      }
    );
  }
}
