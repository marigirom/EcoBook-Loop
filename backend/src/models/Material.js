// models/Material.js

module.exports = (sequelize, DataTypes) => {
  const Material = sequelize.define('Material', {
    type: {
      type: DataTypes.ENUM('book', 'recyclable'),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true, // Only required for books
    },
    condition: {
      type: DataTypes.STRING,
      allowNull: true, // Only for books
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true, // Only for recyclables
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users', // must match table name from User.js
        key: 'id',
      },
    },
  }, {
    tableName: 'materials',
  });

  // Define relationship
  Material.associate = (models) => {
    Material.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  };

  return Material;
};
