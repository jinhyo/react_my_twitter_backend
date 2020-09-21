const passport = require("passport");
const local = require("./local");
const google = require("./google");
const facebook = require("./facebook");
const { User } = require("../models");

module.exports = () => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findOne({ where: { id } });
      done(null, user.toJSON()); // req.user에 넣어줌
    } catch (error) {
      console.error(error);
      done(error);
    }
  });

  local(passport);
  google(passport);
  facebook(passport);
};
