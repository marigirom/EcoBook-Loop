module.exports = (sequelize, DataTypes) => {
  const IncentivePayment = sequelize.define('IncentivePayment', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    materialId: {
      type: DataTypes.INTEGER, 
      allowNull: true, // if incentive/payment is tied to a material
      references: { model: 'materials', key: 'id' },
    },
    type: {
      type: DataTypes.ENUM('incentive', 'payment'),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    method: {
      type: DataTypes.STRING,
      allowNull: true, // e.g., 'mpesa', 'bank', 'bonus-points'
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Completed', 'Failed'),
      defaultValue: 'Pending',
    },
  }, {
    tableName: 'incentive_payments',
  });

  IncentivePayment.associate = (models) => {
    IncentivePayment.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    IncentivePayment.belongsTo(models.Material, { foreignKey: 'materialId', as: 'material' });
  };

  return IncentivePayment;
};