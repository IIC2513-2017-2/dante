module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.addColumn('Users', 'teamId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Teams',
        key: 'id',
      },
    });
  },
  down(queryInterface) {
    return queryInterface.removeColumn('Users', 'teamId');
  },
};
