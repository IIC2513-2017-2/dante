module.exports = function defineTeam(sequelize, DataTypes) {
  const Team = sequelize.define('Team', {
    name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
      },
    },
    repoUrl: {
      type: DataTypes.STRING,
      validate: {
        isUrl: true,
      },
    },
  });
  Team.associate = function associate(models) {
    // associations can be defined here
  };
  return Team;
};
