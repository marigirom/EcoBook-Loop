// models/User.js

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    tableName: 'users',
  });

  // Define association (optional, only if Material model is loaded)
  User.associate = (models) => {
    User.hasMany(models.Material, { foreignKey: 'userId', as: 'materials' });
  };

  return User;
};
