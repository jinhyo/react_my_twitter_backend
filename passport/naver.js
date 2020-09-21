const NaverStrategy = require("passport-naver").Strategy;
require("dotenv").config();
const { User } = require("../models");
const bcrypt = require("bcrypt");
const { BACKEND_URL } = require("../lib/constValue");

module.exports = passport => {
  passport.use(
    new NaverStrategy(
      {
        clientID: process.env.NAVER_CLIENT_ID,
        clientSecret: process.env.NAVER_SECRET,
        callbackURL: `${BACKEND_URL}/auth/naver/callback`
      },

      async (accessToken, refreshToken, profile, done) => {
        try {
          const exUser = await User.findOne({
            where: { snsId: profile.id, loginType: "naver" }
          });

          if (exUser) {
            done(null, exUser.toJSON());
          } else {
            // 페북 로그인용 닉네임 생성
            let nickname = "n" + "_" + profile.displayName;

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
              password: "naver",
              nickname,
              loginType: "naver",
              avatarURL: profile._json.profile_image
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
