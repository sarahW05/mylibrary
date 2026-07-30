import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from "dotenv";
dotenv.config();
const app = express();
const apiKey = process.env.api_key;
const genres = ["fantasy", "mystery", "thriller", "drama", "romance",
                "horror", "science fiction", "adventure", "poetry",
                "history"
];
app.set('view engine', 'ejs');
app.use(express.static('public'));

function randGenre(){
    const randInd = Math.floor(Math.random() * genres.length);

    return genres[randInd];
}

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
app.get('/',async (req, res) => {
    const genre = randGenre();

    const params = new URLSearchParams({
        //books with selected genre
        q: `subject:${genre}`,
        //most relevant first
        orderBy: "relevance",
        //books not magazines
        printType: "books",
        //only requests 20 but api allows maxResults to be up to 40
        maxResults: "20",
        key: apiKey
    });

    const apiUrl = `https://www.googleapis.com/books/v1/volumes?${params.toString()}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    //the .filter makes sure that books that are missing the information we want is removed
    const books = (data.items ?? []).filter((book)=> {
        const bookInfo = book.volumeInfo;

        return(
            bookInfo?.title &&
            bookInfo?.authors?.length >0 &&
            bookInfo?.imageLinks?.thumbnail
        );
    }).slice(0,3);
    // line above makes it so only top 3 books are shown

    res.render('home.ejs', {genre, books});
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
