//2iWElcKr29ZOpPPf

import express from "express";
import mongoose from "mongoose"; 

const app = express();


// Middleware

app.use("/", (req, res, next)=>{
  res.send("Its working");
})

mongoose.connect("mongodb+srv://supplier_management:2iWElcKr29ZOpPPf@cluster0.dkewxhj.mongodb.net/") 
.then(() => console.log("connected to MongoDB"))
.then(() => {
   app.listen(3000);
 }) 
.catch((err) => console.log((err)));