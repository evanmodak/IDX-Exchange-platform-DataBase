require ("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./config/db");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", async (req, res) => {})