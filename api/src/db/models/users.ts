import { Model } from 'sequelize';

export class User extends Model {
  public id!: number;
  public name!: string;
  public instagram: string;
  public reddit: string;
  public discord: string;
}
