import { Sequelize, Model, DataTypes } from 'sequelize';

export class Colorway extends Model {}

export default function init(sequelize: Sequelize) {
  Colorway.init(
    {
      name: DataTypes.STRING
    },
    { sequelize, tableName: 'colorways' }
  );
}
