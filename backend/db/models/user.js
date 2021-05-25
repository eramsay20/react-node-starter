'use strict';
const bcrypt = require('bcryptjs'); // import bcrypt for pass hashing

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 30],
        isNotEmail(value) { // custom validator to ensure username !== email
          if (Validator.isEmail(value)) {
            throw new Error('Cannot be an email.');
          }
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 256]  // email len between 3 & 256 chars
      },
    },
    hashedPassword: {
      type: DataTypes.STRING.BINARY,
      allowNull: false,
      validate: {
        len: [60, 60] // guaranteed to have len of 60 if hashed/binary
      },
    },
  },
    { // add scoping to limit frontend access to sensitive user info
      defaultScope: {
        attributes: {
          exclude: ['hashedPassword', 'email', 'createdAt', 'updatedAt'],
        },
      },
      scopes: {
        currentUser: {
          attributes: { exclude: ['hashedPassword'] },
        },
        loginUser: {
          attributes: {},
        },
      },
    });

  User.associate = function(models) {
    // associations can be defined here
  };

  // instance method - returns obj with the User instance info that is safe to save to a JWT
  User.prototype.toSafeObject = function () { 
    const { id, username, email } = this; // deconstruct id, username and email from instance
    return { id, username, email } // return scrubbed obj
  }

  // instance method - accepts PW string and returns true if matched again hashedPW
  User.prototype.validatePassword = function (password) {
    return bcrypt.compareSync(password, this.hashedPassword.toString())
  }

  // static method - returns a User obj based on id scoped to exclude their hashedPW
  User.getCurrentUserById = async function (id) {
    return await User.scope('currentUser').findByPk(id);
  }

  // static method - find user by username or email 
  User.login = async function ({ credential, password }) {
    const { Op } = require('sequelize'); // grab sequelize operands
    const user = await User.scope('loginUser').findOne({
      where: {
        [Op.or]: { // match either username or email based on 'credential' param
          username: credential,
          email: credential,
        },
      },
    });

    // if a user is found, check the pw and return scope-scrubbed user obj to frontend
    if (user && user.validatePassword(password)) {
      return await User.scope('currentUser').findByPk(user.id);
    }
  };

  // static method - add a new user with provided username, email and pw
  User.signup = async function ({ username, email, password }) {
    const hashedPassword = bcrypt.hashSync(password); // hash pw for storage
    const user = await User.create({ // create new user
      username,
      email,
      hashedPassword,
    });
    return await User.scope('currentUser').findByPk(user.id); // return scope-scrubbed user obj
  };

  return User;
};
