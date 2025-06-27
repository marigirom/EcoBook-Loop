module.exports = (sequelize, DataTypes) => {
  const BonusPayment = sequelize.define('BonusPayment', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    materialId: {
      type: DataTypes.INTEGER, 
      allowNull: true, 
      references: { model: 'materials', key: 'id' },
    },
    type: {
      type: DataTypes.ENUM('Reward-payment'),
      allowNull: false,
      defaultValue: 'Reward-payment', 
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    method: {
      type: DataTypes.STRING,
      allowNull: true, 
      defaultValue: 'M-Pesa'
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Completed', 'Failed'),
      defaultValue: 'Pending',
    },
  }, {
    tableName: 'bonus_payments',
  });

  BonusPayment.associate = (models) => {
    BonusPayment.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    BonusPayment.belongsTo(models.Material, { foreignKey: 'materialId', as: 'material' });
  };

  return BonusPayment;
};
