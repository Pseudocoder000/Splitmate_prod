const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax'
};

const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, cookieOptions);

  res.cookie('refreshToken', refreshToken, cookieOptions);
};

const clearAuthCookies = (res) => {
  res.clearCookie('accessToken');

  res.clearCookie('refreshToken');
};

module.exports = {
  setAuthCookies,
  clearAuthCookies
};