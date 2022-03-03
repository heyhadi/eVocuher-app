if(process.env.NODE_ENV != 'production') {
    require('dotenv').config()
  }
  
  const express = require("express");
  const cors = require("cors");
  const routes = require("./routes");
  const PORT = process.env.PORT || 3002;
  require('dotenv').config();

  const rateLimiter = require('./middleware/rateLimiter');
  
  const app = express();
  
  app.use(cors());
  app.use(rateLimiter)
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  app.use("/", routes);
  
  app.listen(PORT, () => {
    console.log(`app running on port ${PORT}`);
  });
  
  module.exports = app;