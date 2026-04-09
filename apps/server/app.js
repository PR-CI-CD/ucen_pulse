require('dotenv').config()
const express = require('express')
const app = express()

const PORT = process.env.PORT || "0.0.0.0"
app.listen(PORT, () => (
    console.log(`Server is running on ${PORT}`)
))