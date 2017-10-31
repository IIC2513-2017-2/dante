module.exports = function defineLike(sequelize, DataTypes) {
  const Like = sequelize.define('Like', {
    likeable: DataTypes.STRING,
    likeableId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
  });

  Like.associate = function associate(models) {
    Like.belongsTo(models.User, { as: 'user', foreignKey: 'userId' });
  };
  return Like;
};
