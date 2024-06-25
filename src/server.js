import express from "express";
import cors from "cors";
// import { environmentVars } from "./src/config/environmentVar.js";
import UserRoutes from "./routes/user/UserRoutes.js";
import cookieParser from "cookie-parser";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { environmentVars } from "./config/environmentVar.js";
import CategoryRoutes from "./routes/user/CategoryRoutes.js";
import SubCategoryRoutes from "./routes/admin/SubCategoryRoutes.js";
import ProductRoutes from "./routes/admin/ProductRoutes.js";
import ApiEndpointRoutes from "./routes/admin/ApiendpointRoutes.js";
import PermissionRoutes from "./routes/admin/PermissionRoutes.js";
import BrandRoutes from "./routes/admin/BrandRoutes.js";
import SiUnitRoutes from "./routes/admin/SiUnitRoutesRoutes.js";
import RoleRoutes from "./routes/admin/RoleRoutes.js";
import OrderRoutes from "./routes/admin/OrderRoutes.js";
import CartRoutes from "./routes/admin/CartRoutes.js";

import dotenv from "dotenv";
dotenv.config();
import mysql from "mysql2";

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const app = express();
//set up cors
// app.use(cors("*"));
// Set up middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//making upload folder statically accessable
// app.use(express.static("uploads"));

app.use("/uploads", express.static("uploads"));
// app.use('/uploads', express.static(path.join(__dirname, 'src', 'uploads')));

// Increase the JSON payload limit

app.use(express.json({ limit: "1mb" })); // Adjust the limit as needed
app.use(express.urlencoded({ limit: "10mb", extended: true })); // Adjust the limit as needed
app.use(cookieParser());
// Define the allowed origins
const allowedOrigins = ["http://localhost:3000", "http://localhost:3001"];

// Use the cors middleware with specific options
// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     methods: ["POST", "GET", "PUT", "REQUEST", "DELETE"],
//     credentials: true,
//   })
// );

// const connection = mysql.createConnection({
//   host: "mysql-db.c328giyw47da.me-central-1.rds.amazonaws.com:3306", // process.env.DB_HOST,
//   user: "admin",
//   password: "03ycTZRKOxofr6L2IgZY",
//   // database: process.env.DB_NAME
// });

// connection.connect((err) => {
//   if (err) {
//     console.error("Error connecting to the database:", err.stack);
//     return;
//   }
//   console.log("Connected to the database as id", connection.threadId);
// });

app.get("/", async (req, res) => {
  console.log("Hello World ! aqad" + Date.now());
  return res.status(200).send("Hello World ! aqad" + Date.now());
});

app.use("/api/user", UserRoutes);
app.use("/api/product", ProductRoutes);
app.use("/api/category", CategoryRoutes);
app.use("/api/sub_category", SubCategoryRoutes);
app.use("/api/role", RoleRoutes);
app.use("/api/endpoint", ApiEndpointRoutes);
app.use("/api/permission", PermissionRoutes);
app.use("/api/brand", BrandRoutes);
app.use("/api/si_unit", SiUnitRoutes);
app.use("/api/cart", CartRoutes);
app.use("/api/order", OrderRoutes);
for (let i = 0; i < 10; i++) {
  const timestamp = Date.now();
  let id = uuidv4()?.replace(/-/g, "")?.slice(0, 19)?.toString() + timestamp;
  console.log(id, "DASDADS", i);
}
// Start the server
const PORT = environmentVars.port;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
