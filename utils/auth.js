import jwt from 'jsonwebtoken';

function signToken(user) {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '30d',
    },
  );
}

async function isAuth(req, res, next) {
  const { authorization } = req.headers;
  if (authorization) {
    // Bearer xxx => xxx
    const token = authorization.slice(7, authorization.length);
    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        res.status(401).send({ message: 'Token is not valid' });
      } else {
        req.user = decode;
        next();
      }
    });
  } else {
    res.status(401).send({ message: 'Token is not supplied' });
  }
}

async function isAdmin(req, res, next) {
  if (req.user.isAdmin) {
    next();
  } else {
    res.status(401).send({ message: 'User is not Admin' });
  }
}

export { signToken, isAuth, isAdmin };
