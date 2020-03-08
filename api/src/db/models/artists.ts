import { Sculpt } from 'db/models/sculpts';
import {
  HasManyGetAssociationsMixin,
  Model,
  HasManyAddAssociationMixin,
  HasManyHasAssociationMixin,
  Association,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin
} from 'sequelize';

export class Artist extends Model {
  public id!: number;
  public name!: string;
  public instagram: string;
  public website: string;

  public getSculpts!: HasManyGetAssociationsMixin<Sculpt>;
  public addSculpt!: HasManyAddAssociationMixin<Sculpt, number>;
  public hasSculpt!: HasManyHasAssociationMixin<Sculpt, number>;
  public countSculpts!: HasManyCountAssociationsMixin;
  public createSculpt!: HasManyCreateAssociationMixin<Sculpt>;

  public readonly sculpts?: Sculpt[];

  public static associations: {
    sculpts: Association<Artist, Sculpt>;
  };
}
