const express = require('express');
const app = express();
const dotenv = require('dotenv');
const mongoose = require("mongoose");
const cors = require('cors');
const authRoute = require("./routes/auth")
const userRoute = require("./routes/users")
const movieRoute = require("./routes/movies")
const listRoute = require("./routes/lists")

dotenv.config();

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({extended:false}))
mongoose.connect(process.env.MONGO_URL,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.log(err));


app.use('/api/auth', authRoute)
app.use('/api/users', userRoute)
app.use('/api/movies', movieRoute)
app.use('/api/lists', listRoute)


const port = 8080
app.listen(port, () => {
    console.log(`Backend server is running at port ${port}`)
})