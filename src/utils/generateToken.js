import { sign } from 'jsonwebtoken';

function generateTokens(user) {
  const accessToken = sign(
    { userId: user.id },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.ACCESS_EXPIRES_IN }
  );

  const refreshToken = sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
}

export default generateTokens;
