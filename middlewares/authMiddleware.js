exports.isLoggedIn = (req, res, next) => {
  // req.isAuthenticated()는 passport에서 req에 넣어줌
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).send("로그인이 필요합니다.");
  }
};

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    res.status(401).send("로그아웃이 필요합니다.");
  }
};
