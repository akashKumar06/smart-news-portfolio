import express from "express";
import cors from "cors";
import newsRoutes from "./src/routes/newsRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.use("/api/news", newsRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.send("Smart news backend is running!");
});

app.listen(PORT, () => {
  console.log(`Server listening on PORT ${PORT}`);
});
