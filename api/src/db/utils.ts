import { sequelize } from 'db/instance';
import { Artist } from 'db/models/artists';
import { User } from 'db/models/users';
import { Model, DataTypes, Association } from 'sequelize';
import { Sculpt } from 'db/models/sculpts';
import { Colorway } from './models/colorways';
import { Wantlist } from './models/wantlists';

export async function dbInit() {
  await sequelize.authenticate();
  await sequelize.sync({ force: true });
}

export async function buildRelationship() {
  User.init(
    {
      username: DataTypes.STRING,
      instagram: DataTypes.STRING,
      reddit: DataTypes.STRING,
      discord: DataTypes.STRING
    },
    { sequelize, tableName: 'users' }
  );

  Artist.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: DataTypes.STRING,
      instagram: DataTypes.STRING,
      website: DataTypes.STRING
    },
    { sequelize, tableName: 'artists' }
  );
  Sculpt.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: DataTypes.STRING
    },
    { sequelize, tableName: 'sculpts' }
  );

  Colorway.init(
    {
      name: DataTypes.STRING
    },
    { sequelize, tableName: 'colorways' }
  );

  Wantlist.init(
    {
      username: DataTypes.STRING
    },
    { sequelize, tableName: 'wantlists' }
  );

  Colorway.belongsTo(Sculpt, { targetKey: 'id' });
  Sculpt.belongsTo(Artist, { targetKey: 'id' });
  Artist.hasMany(Sculpt);
  Sculpt.hasMany(Colorway);
}

export async function devProvisionning() {
  await User.create({ username: 'bob' });
  const artist = await Artist.create({ name: 'Sludgekidd' });
  const s = await Sculpt.create({ name: 'bub v2' });
  const c = await Colorway.create({ name: 'Friday 13th' });
  await artist.addSculpt(s);
  await s.addColorway(c);
}
