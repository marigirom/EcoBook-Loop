module.exports = (sequelize, DataTypes) => {
  const MaterialRequest = sequelize.define('MaterialRequest', {
    materialId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'materials',
        key: 'id',
      },
    },
    requesterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'Delivered'),
      defaultValue: 'Pending',
    },
    copies: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    tableName: 'material_requests',
  });

  MaterialRequest.associate = (models) => {
    MaterialRequest.belongsTo(models.User, {
      foreignKey: 'requesterId',
      as: 'requester',
    });
    MaterialRequest.belongsTo(models.Material, {
      foreignKey: 'materialId',
      as: 'material',
    });
  };

  return MaterialRequest;
};
