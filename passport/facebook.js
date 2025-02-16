const FacebookStrategy = require("passport-facebook").Strategy;
require("dotenv").config();
const { User } = require("../models");
const bcrypt = require("bcrypt");
const { BACKEND_URL } = require("../lib/constValue");

module.exports = passport => {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_SECRET,
        callbackURL: `${BACKEND_URL}/auth/facebook/callback`,
        profileFields: ["emails", "id", "displayName", "photos"]
      },

      async (accessToken, refreshToken, profile, done) => {
        console.log("profile", profile);

        try {
          const exUser = await User.findOne({
            where: { snsId: profile.id, loginType: "facebook" }
          });

          if (exUser) {
            done(null, exUser.toJSON());
          } else {
            // 페북 로그인용 닉네임 생성
            let nickname = "f" + "_" + profile.displayName;

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
              password: "facebook",
              nickname,
              loginType: "facebook",
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
