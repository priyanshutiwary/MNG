

import express from "express";
import pg from "pg";
import env from "dotenv";
import bodyParser from "body-parser"
import cors from 'cors';
import bcrypt from 'bcrypt'
// const bcrypt = require('bcrypt'); // Assuming you're using bcrypt for password hashing

const app = express();

const port = process.env.PORT || 5001;

app.use(bodyParser.urlencoded({ extended: true}));


// Replace with your actual database credentials (avoid storing them in plain text)
const dbConfig = {
  user: "postgres",
  host: "localhost",
  database: "MNG",
  password: "one trillion",
  port: 5433,
};

const db = new pg.Client(dbConfig);
const saltRounds=10;

db.connect((err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1); // Exit the process on failure
  } else {
    console.log('Database connected successfully');
  }
});

app.use(express.json()); // Parse JSON request bodies


app.get('/api/data',(req,res) =>{
    res.send("hello")
})


app.post("/api/register", async (req, res) => {
    
    const {name,username,email, password} =req.body
  
    try {
      const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
        email
      ]);
  
      if (checkResult.rows.length > 0) {
        res.send("Email already exists. Try logging in.");
        console.log('success');
      } else {
        //hashing the password and saving it in the database
        console.log("entered else statement");
        await db.query(
            "INSERT INTO users (email, password,username,name) VALUES ($1, $2, $3, $4)",
            [email,password,username,name]
            
          );
          console.log("registerd")
        // bcrypt.hash(password, saltRounds, async (err, hash) => {
        //   if (err) {
        //     console.log("entered hash if");
        //     console.error("Error hashing password:", err);

        //   } else {
        //     console.log("enterd");
        //     console.log("Hashed Password:", hash);
        //     await db.query(
        //       "INSERT INTO users (email, password,username,name) VALUES ($1, $2, $3, $4)",
        //       [email,hash,username,name]
        //     );
        //     console.log(registered)
        //   }
        //   console.log("exited has ");
        // });
        res.json({ success: true});//
      }
    } catch (err) {
      console.log(err);
    }
  });
  
  app.post("/api/login", async (req, res) => {
    const {email, password}= req.body
  
    try {
      const result = await db.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);
      
      if (result.rows.length > 0 && password===result.rows[0].password) {
        // const user = result.rows[0].password;
        
        // const pass = result.rows[0].password
        // console.log(pass);
        const username =result.rows[0].username;
        const name = result.rows[0].name;
        res.status(200).json({success: true,username:{username},name:{name},email:{email}})
        
        // const storedHashedPassword = user.password;
        // //verifying the password
        // bcrypt.compare(loginPassword, storedHashedPassword, (err, result) => {
        //   if (err) {
        //     console.error("Error comparing passwords:", err);
        //   } else {
        //     if (result) {
        //       res.render("secrets.ejs");
        //     } else {
        //       res.send("Incorrect Password");
        //     }
        //   }
        // });
        
      } else {
        res.status(404).json({message:'User not found'});
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: 'Internal server error' });


    }
  });






// app.post('/api/login', async (req, res) => {
//   console.log("reached")
  
//   try{
//     const { email, password } = req.body
//     const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
//     if (result.rows.length > 0){
//     const user = result.rows[0];
//     const pass = user.password;
    
//     }else{
//             res.status(401).json({ error: 'Invalid credentials' });
//           }
    


//   }catch{
//        console.error('Login error:', error);
//     res.status(500).json({ error: 'Internal server error' }); 

//   }

  
  // try {
  //   const { email, password } = req.body;

  //   // Retrieve user information from the database based on email
  //   const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);

  //   // Check if user exists and passwords match
  //   if (user.rows.length > 0 && await bcrypt.compare(password, user.rows[0].password)) {
  //     // Authentication successful
  //     // Generate token (replace with your token generation logic)
  //     // const token = /* generate token */;

  //     res.json("true");//{ success: true, token }
  //   } else {
  //     res.status(401).json({ error: 'Invalid credentials' });
  //   }
  // } catch (error) {
  //   console.error('Login error:', error);
  //   res.status(500).json({ error: 'Internal server error' }); // Change to a more specific error message if possible
  // }
// });

app.listen(port, () => {
  console.log(`Server started at port ${port}`);
});
