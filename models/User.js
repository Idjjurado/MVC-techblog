const { Model, DataTypes } = require("sequelize");
const connection = require("../config/connection");
const bcrypt = require("bcrypt");

class User extends Model {
  // this is a method that will check the password
  checkPassword(loginPw) {
    return bcrypt.compareSync(loginPw, this.password);
  }
}

User.init(
  {
    // This key is the one referenced in the other models (comment, post)
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      // This is a validation that the password must be at least 8 characters long
      validate: {
        len: [8],
      },
    },
  },
  {
    // these hooks are for the password hashing
    hooks: {
      // this beforeCreate hook is for when a new user is created
      beforeCreate: async (newUserData) => {
        const plainTextPassword = newUserData.password;
        const hashedPassword = await bcrypt.hash(plainTextPassword, 10);
        newUserData.password = hashedPassword;
        return newUserData;
      },
      // this beforeUpdate hook is for when a user is updated
      beforeUpdate: async (updatedUserData) => {
        const plainTextPassword = updatedUserData.password;
        const hashedPassword = await bcrypt.hash(plainTextPassword, 10);
        updatedUserData.password = hashedPassword;
        return updatedUserData;
      },
    },
    sequelize: connection,
    timestamps: false,
    freezeTableName: true,
    modelName: "user",
  }
);

module.exports = User;
