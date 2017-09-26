const crypto = require('crypto');

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

  return User;
};
