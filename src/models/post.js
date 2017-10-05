const moment = require('moment');
const showdown = require('showdown');
const striptags = require('striptags');

const converter = new showdown.Converter({
  rawHeaderId: true,
});

function renderMarkdown(post) {
  if (post.changed('bodySource')) {
    post.setDataValue('body', converter.makeHtml(post.bodySource));
    // setDataValue sets property skipping setter (empty setter, look below)
  }
}

module.exports = function definePost(sequelize, DataTypes) {
  const Post = sequelize.define('Post', {
    title: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
      },
    },
    body: {
      type: DataTypes.TEXT,
      set() {
        // do nothing.
      },
    },
    bodySource: {
      type: DataTypes.TEXT,
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
        return moment().startOf('day').utc().toDate();
      },
      allowNull: false,
    },
    authorId: {
      type: DataTypes.INTEGER,
    },
  });

  Post.beforeUpdate(renderMarkdown);
  Post.beforeCreate(renderMarkdown);

  Post.associate = function associate(models) {
    Post.belongsTo(models.User, { as: 'author', foreignKey: 'authorId' });
  };

  Post.prototype.inputDate = function inputDate() {
    return moment.utc(this.publishDate).format('YYYY-MM-DD');
  };

  Post.prototype.displayDate = function inputDate() {
    return moment.utc(this.publishDate).locale('es').format('LL');
  };

  Post.prototype.isPublished = function isPublished() {
    return this.status === 'published';
  };

  Post.prototype.displayStatus = function displayStatus() {
    return this.status === 'draft' ? 'Borrador' : 'Publicado';
  };

  Post.prototype.getExcerpt = function getExcerpt(length = 80) {
    const excerpt = striptags(this.body).replace(/(\r\n|\n|\r)+/gm, ' ')
      .substring(0, length).trim();
    return excerpt.length ? `${excerpt}…` : 'Sin contenido';
  };

  return Post;
};
