const success = (res, data = null, status = 200) => {
  return res.status(status).json({
    success: true,
    data
  });
};

module.exports = {
  success
};