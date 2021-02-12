const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const urlencodedParser = bodyParser.json();

// connect with postgres db
const { Pool } = require("pg");

const pool = new Pool({
    user: "m.plekhova",
    host: "localhost",
    database: "postgres",
    password: "dre#$ioP_B",
    port: 5432,
});

app.options("*", (req, res) => {
    res.set("Access-Control-Allow-Origin", "http://localhost:3000");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Allow-Credentials", "true");
    res.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.send("ok");
});

// get users table
app.get("/", (req, res) => {
    res.set("Access-Control-Allow-Origin", "http://localhost:3000");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Allow-Credentials", "true");
    res.set("Access-Control-Allow-Methods", "GET, OPTIONS");

    pool.query("SELECT * FROM users ORDER BY id ASC", (error, results) => {
        if (error) {
            throw error;
        }
        res.status(200).json(results.rows);
    });
});

// post new user data
app.post("/", urlencodedParser, (req, res) => {
    res.set("Access-Control-Allow-Origin", "http://localhost:3000");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Allow-Credentials", "true");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");

    const { userID, dateRegistration, dateLastActivity } = req.body;

    pool.query(
        `INSERT INTO users (id, date_registration, date_last_activity) VALUES ($1, TO_DATE($2, 'dd.mm.yyyy') + integer '1', TO_DATE($3, 'dd.mm.yyyy') + integer '1')`,
        [userID, dateRegistration, dateLastActivity],
        (error, results) => {
            if (error) {
                throw error;
            }
            res.status(201).send(`user added`);
        }
    );
});

// count users by date_last_activity (rolling retention parameter)
app.get("/rollingRetentionX", (req, res) => {
    res.set("Access-Control-Allow-Origin", "http://localhost:3000");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Allow-Credentials", "true");
    res.set("Access-Control-Allow-Methods", "GET, OPTIONS");

    pool.query(
        "SELECT COUNT (*) FROM users WHERE date_last_activity <= NOW() - INTERVAL '7 DAY'",
        (error, results) => {
            if (error) {
                throw error;
            }
            res.status(200).json(results.rows);
        }
    );
});

// count users by date_registration (rolling retention parameter)
app.get("/rollingRetentionY", (req, res) => {
    res.set("Access-Control-Allow-Origin", "http://localhost:3000");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Allow-Credentials", "true");
    res.set("Access-Control-Allow-Methods", "GET, OPTIONS");

    pool.query(
        "SELECT COUNT (*) FROM users WHERE date_registration <= NOW() - INTERVAL '7 DAY'",
        (error, results) => {
            if (error) {
                throw error;
            }
            res.status(200).json(results.rows);
        }
    );
});

app.listen(1337);
