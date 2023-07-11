const sequelize = require('../config/connection');
const { User, Post, Comment } = require('../models');

const userData = require('./userSeed.json');
const postData = require('./postSeed.json');
const commentData = require('./commentSeed.json');

// this is the seed data function
const seedData = async () => {
    // this is the sequelize sync function, this will sync all of the models to the database
    await sequelize.sync({ force: true });

    // this is the bulkCreate function, this will create all of the data in the database
    await User.bulkCreate(userData, { individualHooks: true });
    await Post.bulkCreate(postData);
    await Comment.bulkCreate(commentData);

    console.log('Seed data success!!');

    // this is the process.exit function, this will exit the process when the seed data is complete
    process.exit(0);
};

// this is the call to the seed data function
seedData();