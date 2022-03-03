if(process.env.NODE_ENV != 'production') {
    require('dotenv').config()
  }
  
  const express = require("express");
  const cors = require("cors");
  const routes = require("./routes");
  const PORT = process.env.PORT || 3002;
  require('dotenv').config();
  
  const app = express();
  
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  app.use("/", routes);
  
  app.listen(PORT, () => {
    console.log(`app running on ${PORT}`);
  });
  
  module.exports = app;