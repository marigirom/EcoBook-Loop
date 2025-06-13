module.exports = (sequelize, DataTypes) => {
  const Schedule = sequelize.define('Schedule', {
    requestId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'material_requests',
        key: 'id',
      },
    },
    scheduledDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    pickupLocation: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    logisticsProvider: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'schedules',
  });

  Schedule.associate = (models) => {
    Schedule.belongsTo(models.MaterialRequest, {
      foreignKey: 'requestId',
      as: 'request',
    });
  };

  return Schedule;
};
