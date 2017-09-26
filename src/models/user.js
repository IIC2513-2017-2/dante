const bcrypt = require('bcrypt');
const crypto = require('crypto');

async function buildPasswordHash(instance) {
  if (instance.changed('password')) {
    const hash = await bcrypt.hash(instance.password, 10);
    instance.set('password', hash);
  }
}

module.exports = function defineUser(sequelize, DataTypes) {
  const User = sequelize.define('User', {
    firstName: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
      },
    },
    lastName: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      validate: {
        len: [6],
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
        isEmail: true,
      },
    },
    username: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
      },
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: 'user',
      allowNull: false,
      validate: {
        notEmpty: true,
        isIn: [['user', 'admin']],
      },
    },
  });

  User.beforeUpdate(buildPasswordHash);
  User.beforeCreate(buildPasswordHash);

  User.associate = function associate(models) {
    User.belongsTo(models.Team, { foreignKey: 'teamId' });
  };

  User.prototype.fullName = function fullName() {
    return `${this.firstName} ${this.lastName}`;
  };

  User.prototype.gravatarUrl = function gravatarUrl(size = 50) {
    const emailHash = crypto.createHash('md5')
      .update(this.email.trim()).digest('hex');
    return `https://www.gravatar.com/avatar/${emailHash}?s=${size}`;
  };

  User.prototype.checkPassword = function checkPassword(password) {
    return bcrypt.compare(password, this.password);
  };

  User.prototype.isAdmin = function isAdmin() {
    return this.role === 'admin';
  };

  return User;
};
