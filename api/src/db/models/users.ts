import {
  HasManyGetAssociationsMixin,
  Model,
  HasManyAddAssociationMixin,
  HasManyHasAssociationMixin,
  Association,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin
} from 'sequelize';
import { Collection } from 'db/models/collections';
import { Wantlist } from 'db/models/wantlists';

export class User extends Model {
  public id!: number;
  public name!: string;
  public instagram: string;
  public reddit: string;
  public discord: string;

  public getCollections!: HasManyGetAssociationsMixin<Collection>;
  public addCollection!: HasManyAddAssociationMixin<Collection, number>;
  public hasCollection!: HasManyHasAssociationMixin<Collection, number>;
  public countCollections!: HasManyCountAssociationsMixin;
  public createCollection!: HasManyCreateAssociationMixin<Collection>;

  public readonly collections?: Collection[];

  public getWantlists!: HasManyGetAssociationsMixin<Wantlist>;
  public addWantlist!: HasManyAddAssociationMixin<Wantlist, number>;
  public hasWantlist!: HasManyHasAssociationMixin<Wantlist, number>;
  public countWantlists!: HasManyCountAssociationsMixin;
  public createWantlist!: HasManyCreateAssociationMixin<Wantlist>;

  public readonly Wantlists?: Wantlist[];

  public static associations: {
    collections: Association<User, Collection>;
    wantlists: Association<User, Wantlist>;
  };
}
