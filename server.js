// const express = require("express");
// const app = require('./app');
// const db = require('./models'); 
// const userRoute = require("./routes/userRoutes");
// const menuRoute = require("./routes/menuRoutes");
// const orderRoute = require("./routes/orderRoutes");
import express from "express";
import app from "./app";
import db from "./models";
import userRoute from "./routes/userRoutes";
import menuRoute from "./routes/menuRoutes";
import orderRoute from "./routes/orderRoutes";
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
app.use('/pizza',orderRoute);
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});