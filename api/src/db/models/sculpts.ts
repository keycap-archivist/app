import {
  Model,
  Association,
  HasManyCreateAssociationMixin,
  HasManyCountAssociationsMixin,
  HasManyAddAssociationMixin,
  HasManyHasAssociationMixin,
  HasManyGetAssociationsMixin
} from 'sequelize';
import { Colorway } from 'db/models/colorways';
export class Sculpt extends Model {
  public id!: number;
  public name!: string;

  public getColorways!: HasManyGetAssociationsMixin<Colorway>;
  public addColorway!: HasManyAddAssociationMixin<Colorway, number>;
  public hasColorway!: HasManyHasAssociationMixin<Colorway, number>;
  public countColorways!: HasManyCountAssociationsMixin;
  public createColorway!: HasManyCreateAssociationMixin<Colorway>;

  public readonly Colorways?: Colorway[];

  public static associations: {
    Colorways: Association<Sculpt, Colorway>;
  };
}
