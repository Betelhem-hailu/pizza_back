const express = require("express");
const app = require('./app');
const db = require('./models'); 
const userRoute = require("./routes/registerRoutes");
const menuRoute = require("./routes/menuRoutes");
app.use(express.static("uploads"));

const port = process.env.PORT || 8000;

db.sequelize.sync({ force: false }) 
  .then(() => {
    console.log('Database connected and models synced.');
  })
  .catch(err => {
    console.error('Error connecting to the database:', err);
  });

app.get("/pizza", (req, res) => {
    res.send("Here is Backend...");
  });
  
app.use('/pizza',userRoute);
app.use('/pizza',menuRoute);
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});