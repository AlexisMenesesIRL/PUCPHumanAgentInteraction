const express = require("express");
const path = require('path')
const app = express();
const port = 5000;

app.use('/', express.static(path.join(__dirname, 'public')))

app.listen(port, () => {
    console.log(`Mi primer servidor en nodejs en el puerto ${port}`)
  })
