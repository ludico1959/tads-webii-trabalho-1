const express = require("express");
const methodOverride = require("method-override");
require("dotenv").config();
const userRoutes = require("./routes/users.routes");

const PORT = process.env.SERVER_PORT || 3000;

const app = express();

app.set("view engine", "ejs");
app.set("views", "src/views");

app.use(methodOverride("_method"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`);
});
