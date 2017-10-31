module.exports = function defineLike(sequelize, DataTypes) {
  const Like = sequelize.define('Like', {
    // id is included because otherwise using include: ['likes'] will return
    // only one record.
    // https://github.com/sequelize/sequelize/issues/5193#issuecomment-316970628
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    likeable: {
      type: DataTypes.STRING,
      unique: 'uniqueLike',
    },
    likeableId: {
      type: DataTypes.INTEGER,
      unique: 'uniqueLike',
    },
    userId: {
      type: DataTypes.INTEGER,
      unique: 'uniqueLike',
    },
  });

  Like.associate = function associate(models) {
    Like.belongsTo(models.User, { as: 'user', foreignKey: 'userId' });
    Like.belongsTo(models.Post, {
      as: 'post',
      foreignKey: 'likeableId',
      scope: {
        likeable: 'post',
      },
    });
  };
  return Like;
};
