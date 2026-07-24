import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from "dotenv";
const app = express();
dotenv.config();
app.set('view engine', 'ejs');
app.use(express.static('public'));

//for Express to get values using the POST method
app.use(express.urlencoded({extended:true}));
//setting up database connection pool, replace values in red
const pool = mysql.createPool({
    host: process.env.db_host,
    user: process.env.db_user,
    password: process.env.db_pass,
    database: process.env.db,
    connectionLimit: 10,
    waitForConnections: true
});
//routes
app.get('/', (req, res) => {
   res.render('home.ejs');
});

app.get('/want', (req, res) => {
    res.render('want.ejs');
});

app.get('/done', (req, res) => {
    res.render('done.ejs');
});


app.get("/dbTest", async(req, res) => {
   try {
        const [rows] = await pool.query("SELECT CURDATE()");
        res.send(rows);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error!");
    }
    
});//dbTest
app.listen(3000, ()=>{
    console.log("Express server running")
})
