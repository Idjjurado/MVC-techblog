const { Model, DataTypes } = require('sequelize');
const connection = require('../config/connection');

class Post extends Model {}

Post.init(
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            // tells sequelize that this is the primary key
            // most id's are primary keys
            primaryKey: true,
            // autoIncrement means that the id will auto increment
            autoIncrement: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        text: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        userId: {
            type: DataTypes.INTEGER,
            references: {
                // this key is the same as the other key in the other model (user)
                model: 'user',
                key: 'id',
            },
        },
    },
    {
        // this is the connection instance ALWAYS make sure it is in its own object
        sequelize: connection,
        freezeTableName: true,
        modelName: 'post',
    }
);

module.exports = Post;