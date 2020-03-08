import { Sequelize, Model, DataTypes } from 'sequelize';
// const sequelize = new Sequelize('sqlite::memory:');

export class User extends Model {}
export function init(sequelize: Sequelize) {
  User.init(
    {
      username: DataTypes.STRING
    },
    { sequelize, tableName: 'users' }
  );
}
