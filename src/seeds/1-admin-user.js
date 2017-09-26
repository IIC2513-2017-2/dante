const bcrypt = require('bcrypt');

module.exports = {
  up(queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('Person', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */

    const adminUser = {
      firstName: 'Adam',
      lastName: 'Minier',
      email: 'admin@email.com',
      password: bcrypt.hashSync('123456789', 10),
      role: 'admin',
      username: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return queryInterface.bulkInsert('Users', [adminUser]);
  },

  down(queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('Person', null, {});
    */

    return queryInterface.bulkDelete('Users', null, {});
  },
};
