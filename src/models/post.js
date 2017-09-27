const moment = require('moment');

module.exports = function definePost(sequelize, DataTypes) {
  const Post = sequelize.define('Post', {
    title: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
      },
    },
    body: {
      type: DataTypes.STRING,
    },
    bodySource: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'draft',
      allowNull: false,
      validate: {
        notEmpty: true,
        isIn: [['draft', 'published']],
      },
    },
    publishDate: {
      type: DataTypes.DATE,
      defaultValue() {
        const todayValue = moment().startOf('day').utc().toDate();
        console.log(todayValue);
        return todayValue;
      },
      allowNull: false,
    },
    authorId: {
      type: DataTypes.INTEGER,
    },
  });

  Post.associate = function associate(models) {
    Post.belongsTo(models.User, { as: 'author', foreignKey: 'authorId' });
  };

  Post.prototype.inputDate = function inputDate() {
    return moment.utc(this.publishDate).format('YYYY-MM-DD');
  };

  Post.prototype.displayDate = function inputDate() {
    return moment.utc(this.publishDate).locale('es').format('LL');
  };

  Post.prototype.displayStatus = function displayStatus() {
    return this.status === 'draft' ? 'Borrador' : 'Publicado';
  };

  return Post;
};
