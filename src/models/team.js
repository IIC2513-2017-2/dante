module.exports = function defineTeam(sequelize, DataTypes) {
  const Team = sequelize.define('Team', {
    name: DataTypes.STRING,
    repoUrl: DataTypes.STRING,
  });
  Team.associate = function associate(models) {
    // associations can be defined here
  };
  return Team;
};