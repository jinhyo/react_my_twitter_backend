import User from "../models/user";
import passport from "passport";
import local from "./local";
import google from "./google";
import facebook from "./facebook";

export default () => {
  passport.serializeUser((user: User, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await User.findOne({ where: { id } });
      done(null, user!.toJSON()); // req.user에 넣어줌
    } catch (error) {
      console.error(error);
      done(error);
    }
  });

  local(passport);
  google(passport);
  facebook(passport);
};
