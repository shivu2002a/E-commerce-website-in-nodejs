const sequelize = require('../utils/database')
const Sequelize = require('sequelize')

const User = sequelize.define('users', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    name: Sequelize.STRING,
    email: Sequelize.STRING
})

module.exports = User