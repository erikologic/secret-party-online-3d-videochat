const express = require('express')
const PORT = process.env.PORT || 5000

express()
  .get('/', (req, res) => {
    console.log("got res!")
    return res.body("Hello!")
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))