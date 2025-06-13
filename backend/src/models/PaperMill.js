module.exports = (sequelize, DataTypes) => {
  const PaperMillRequest = sequelize.define('PaperMillRequest', {
    materialId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'materials',
        key: 'id',
      },
    },
    millId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    quantityRequested: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'Delivered'),
      defaultValue: 'Pending',
    },
  }, {
    tableName: 'paper_mill_requests',
  });

  PaperMillRequest.associate = (models) => {
    PaperMillRequest.belongsTo(models.User, {
      foreignKey: 'millId',
      as: 'mill',
    });
    PaperMillRequest.belongsTo(models.Material, {
      foreignKey: 'materialId',
      as: 'material',
    });
  };

  return PaperMillRequest;
};
