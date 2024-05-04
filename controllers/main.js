const path = require('path')

const start = async (req, res) => {
  const filePath = path.join(__dirname, '../index.html');
  res.sendFile(filePath);
}

const home = async (req, res) => {
  // make sure to verify 
  console.log(req.userId)

  // let user = req.user.displayName
  res.send(`Hello`)
}

module.exports = {
  start,
  home
}