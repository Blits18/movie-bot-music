const app = require('express')();

app.get('/', (req, res) => res.send('Welcome The bot copy link and paste in uptimeRobot suc6'));

module.exports = () => {
  app.listen(3000);
}