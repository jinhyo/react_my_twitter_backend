const GoogleStrategy = require("passport-google-oauth20").Strategy;
require("dotenv").config();
const { User } = require("../models");
const bcrypt = require("bcrypt");

module.exports = passport => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_SECRET,
        callbackURL: "http://localhost:3001/auth/google/callback"
      },

      async (accessToken, refreshToken, profile, done) => {
        try {
          const exUser = await User.findOne({
            where: { snsId: profile.id, loginType: "google" }
          });

          if (exUser) {
            done(null, exUser.toJSON());
          } else {
            // 구글 로그인용 닉네임 생성
            let nickname = "g" + "_" + profile.displayName;

            // 같은 닉네임이 있을 경우 변경
            const exNick = await User.findOne({
              where: { nickname }
            });

            if (exNick) {
              nickname = await bcrypt.hash(exNick.nickname, 10);
              nickname = nickname.slice(0, 20);
            }

            const newUser = await User.create({
              email: profile.emails[0].value,
              snsId: profile.id,
              password: "google",
              nickname,
              loginType: "google",
              avatarURL: profile.photos[0].value
            });
            done(null, newUser.toJSON());
          }
        } catch (error) {
          console.error(error);
          done(error);
        }
      }
    )
  );
};
