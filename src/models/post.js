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

function destroyLikesHook(post) {
  return post.destroyLikes();
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
        return moment().toDate();
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
  Post.beforeDestroy(destroyLikesHook);

  Post.associate = function associate(models) {
    Post.belongsTo(models.User, { as: 'author', foreignKey: 'authorId' });
    Post.hasMany(models.Like, {
      as: 'likes',
      foreignKey: 'likeableId',
      scope: {
        likeable: 'post',
      },
    });
    Post.belongsToMany(models.User, {
      through: {
        model: models.Like,
        scope: {
          likeable: 'post',
        },
      },
      as: 'likedByUsers',
      foreignKey: 'likeableId',
    });
  };

  Post.findBySlug = function findBySlug(slug, options) {
    return Post.find({ where: { slug }, ...options });
  };

  Post.findPublishedBySlug = function findBySlug(slug, options) {
    return Post.scope('published').find({ where: { slug }, ...options });
  };

  Post.findPublishedPaginated = function findPublishedPaginated(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    return Post.findAndCount({
      where: { status: 'published' },
      offset,
      limit,
      order: [['publishDate', 'DESC']],
      include: ['author', 'likes', 'likedByUsers'],
    });
  };

  Post.prototype.inputDate = function inputDate() {
    return moment(this.publishDate).format('YYYY-MM-DDTHH:mm');
  };

  Post.prototype.displayDate = function inputDate() {
    return moment(this.publishDate).locale('es').format('LL');
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

  Post.prototype.destroyLikes = function destroyLikes() {
    return sequelize.models.Like.destroy({
      where: {
        likeable: 'post',
        likeableId: this.id,
      },
    });
  };

  Post.prototype.hasLikeFromUser = function hasLikeFromUser(user) {
    if (!user) {
      return false;
    }
    return this.likes.some(like => like.userId === user.id);
  };

  return Post;
};
