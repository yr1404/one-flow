// models/user.js
const { DataTypes } = require("sequelize");

const sequelize = require("./db-sequelize");
const bcrypt = require('bcryptjs');

const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(150), allowNull: false },
  email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  password_hash: { type: DataTypes.TEXT },
  role: { type: DataTypes.STRING(50), defaultValue: "user" },
  hourly_rate: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
  // virtual password field for setting plain password
  password: {
    type: DataTypes.VIRTUAL,
    set(value) {
      // store plain password temporarily; hooks will hash into password_hash
      this.setDataValue('password', value);
    },
    get() {
      return this.getDataValue('password');
    }
  }
}, {
  defaultScope: {
    attributes: { exclude: ['password_hash'] }
  },
  scopes: {
    withHash: { attributes: {} }
  },
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      // if virtual password changed, hash it
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// instance methods
User.prototype.comparePassword = async function(candidate) {
  if (!this.password_hash) return false;
  return bcrypt.compare(candidate, this.password_hash);
};

User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.password_hash;
  delete values.password; // virtual
  return values;
};

module.exports = User;
