import express from "express";
import pg from "pg";
import env from "dotenv";
import bodyParser from "body-parser"
import cors from 'cors';
import bcrypt from 'bcrypt'
import jsonwebtoken from 'jsonwebtoken'
// const bcrypt = require('bcrypt'); // Assuming you're using bcrypt for password hashing

const app = express();

const port = process.env.PORT || 5001;

app.use(bodyParser.urlencoded({ extended: true}));
env.config();

// Replace with your actual database credentials (avoid storing them in plain text)
const dbConfig = {
//     user: "postgres",
//   host: "localhost",
//   database: "MNG",
//   password: "one trillion",
//   port: 5433,
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
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
app.use(cors({
    origin: "*", // Replace with specific allowed origins or use whitelist approach
    credentials: true // Enable cookies for proper authentication handling
  }));
app.use(express.json()); // Parse JSON request bodies


app.get('/api/data',(req,res) =>{
    res.send("hello")
})


// **Register endpoint**
app.post("/api/register", async (req, res) => {

    const { name, username, email, password } = req.body;
  
    try {
      // Check for existing email
      const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);
  
      if (checkResult.rows.length > 0) {
        return res.status(400).json({ message: "Email already exists" });
      }
  
      // Hash the password securely before storing
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      console.log(hashedPassword)
      // Insert user into database
      await db.query(
        "INSERT INTO users (email, password,username,name) VALUES ($1, $2, $3, $4)",
              [email,hashedPassword,username,name]
      );
      console.log("data inserted")
  
      res.status(200).json({ success: true, message: "Registration successful" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  



    



// app.post("/api/login", async (req, res) => {
//     const { email, password } = req.body;
  
//     try {
//       // Find user by email
//       const result = await db.query("SELECT * FROM users WHERE email = $1", [
//         email,
//       ]);
      
  
//       if (result.rows.length === 0) {
//         return res.status(401).json({ message: "Invalid credentials" });
//       }
  
//       const user = result.rows[0];
  
//       // Compare password hashes securely
//       const isPasswordValid = await bcrypt.compare(password, user.password);
  
//       if (!isPasswordValid) {
//         return res.status(401).json({ message: "Invalid credentials" });
//       }
  
//       // Generate and send a secure JSON Web Token (JWT)
//       const token = generateJwtToken({ id: user.id, email: user.email, username: user.username });
      
//       res.status(200).json({ success: true, message:"success"});   
//      } catch (err) {
//       console.error(err);
//       res.status(500).json({ message: "Internal server error" });
//     }
//   });
  




  
  app.post("/api/login", async (req, res) => {
    const {email, password}= req.body
  
    try {
      const result = await db.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);
      const user =result.rows[0]
      console.log("Reached flag1 ");
      if (result.rows.length > 0 ) {//&& password===await bcrypt.compare(password, user.password)
        // const userData = result.rows[0];
        
        // const pass = result.rows[0].password
        // console.log(pass);
        console.log(('reachef flag2'))
        // const username =result.rows[0].username;
        // const name = result.rows[0].name;
        const token = generateJwtToken({ id: user.id, email: user.email, username: user.username });
        
        res.status(200).json({ success: true,token});
        
        
        
      } else {
        res.status(404).json({message:'User not found'});
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: 'Internal server error' });


    }
  });








app.listen(port, () => {
  console.log(`Server started at port ${port}`);
});



function generateJwtToken(userData) {
    // Implement token generation using jsonwebtoken library
    // Consider using environment variables for secret key and expiration time
    const secretKey = process.env.JWT_SECRET; // Store secret key securely
    const expiresIn = "1h"; // Adjust expiration time as needed
  
    return jsonwebtoken.sign(userData, secretKey)

}
