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
    copies: {
     type: DataTypes.INTEGER,
     allowNull: true, //for books but required for recyclables 
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    available:{
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users', 
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
     Material.hasMany(models.MaterialRequest, {
        foreignKey: 'materialId',
        as: 'requests',
    });
  };

  return Material;
};
