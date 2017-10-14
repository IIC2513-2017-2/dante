module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.addColumn('Posts', 'slug', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });
  },
  down(queryInterface) {
    return queryInterface.removeColumn('Posts', 'slug');
  },
};
