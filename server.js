require("dotenv").config();

const pool = require("./configure");
const propertiesRouter = require("./routes/properties");
 
const app = express();
 
app.use(cors());
app.use(express.json());
 
app.get("/api/health", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS status");
 
    res.status(200).json({
      success: true,
      database: "connected",
      result: rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      database: "disconnected",
      error: error.message,
    });
  }
});
 
app.use("/api/properties", propertiesRouter);
 
const PORT = process.env.PORT || 5000;
 
const httpServer = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

httpServer.on("error", (err) => {
  console.error("SERVER ERROR:", err);
});
