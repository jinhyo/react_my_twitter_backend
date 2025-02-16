const { Strategy: LocalStrategy } = require("passport-local");
const { User } = require("../models");
const bcrypt = require("bcrypt");

module.exports = passport => {
  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          const loginUser = await User.findOne({
            where: { email, loginType: "local" }
          });

          if (loginUser) {
            const passwordResult = await bcrypt.compare(
              password,
              loginUser.password
            ); // true or false 반환
            if (passwordResult) {
              done(null, loginUser.toJSON());
            } else {
              done(null, false, { reason: "비밀번호가 일치하지 않습니다." });
            }
          } else {
            done(null, false, { reason: "가입되지 않은 이메일 입니다." });
          }
        } catch (error) {
          // 서버 에러 판별
          console.error(error);
          done(error); // done의 첫 번쨰 인자는 서버에러 데이터
        }
      }
    )
  );
};
