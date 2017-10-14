const moment = require('moment');
const showdown = require('showdown');
const striptags = require('striptags');
const slugify = require('slugify');

const converter = new showdown.Converter({
  rawHeaderId: true,
});

function renderMarkdown(post) {
  if (post.changed('bodySource')) {
    post.setDataValue('body', converter.makeHtml(post.bodySource));
    // setDataValue sets property skipping setter (empty setter, look below)
  }
}

function slugifyTitle(post) {
  if (!post.getDataValue('slug')) {
    post.setDataValue('slug', slugify(`${post.title} ${post.id}`, {
      replacement: '-',
      lower: true,
    }));
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
      set() {},
    },
    bodySource: {
      type: DataTypes.TEXT,
    },
    slug: {
      type: DataTypes.STRING,
      set() {},
      get() {
        slugifyTitle(this);
        return this.getDataValue('slug');
      },
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
  }, {
    scopes: {
      published: {
        where: {
          status: 'published',
        },
      },
    },
  });

  Post.beforeUpdate(renderMarkdown);
  Post.beforeCreate(renderMarkdown);
  Post.beforeUpdate(slugifyTitle);
  Post.afterCreate(slugifyTitle);

  Post.associate = function associate(models) {
    Post.belongsTo(models.User, { as: 'author', foreignKey: 'authorId' });
  };

  Post.findBySlug = function findBySlug(slug, options) {
    return Post.find({ where: { slug }, ...options });
  };

  Post.findPublishedBySlug = function findBySlug(slug, options) {
    return Post.scope('published').find({ where: { slug }, ...options });
  };

  Post.findPublishedPaginated = function findPublishedPaginated(page, limit = 10, options) {
    const offset = (page - 1) * limit;
    return Post.findAndCount({
      where: { status: 'published' },
      offset,
      limit,
      order: [['publishDate', 'DESC']],
      ...options,
    });
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
