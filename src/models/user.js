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
      validate: {
        allowNull: false,
        notEmpty: true,
        isIn: [['user', 'admin']],
      },
    },
  });
  User.associate = function associate(models) {
    // associations can be defined here
  };
  return User;
};
