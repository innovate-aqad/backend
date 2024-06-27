import express from "express";
import cors from "cors";
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
import mysql from 'mysql2';

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
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
];

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
// console.log(environmentVars,"environmentVars");
const connection = mysql.createConnection({
  host:environmentVars.host, //process.env.HOST,
  user:environmentVars.dbUser, //    process.env.USER, 
  password: environmentVars.dbPass , // process.env.PASSWORD,
  database:  environmentVars.dbName, // process.env.DBNAME, 
  port:  environmentVars.dbPort , // process.env.DBPORT
});

// Open the MySQL connection
connection.connect(error => {
  if (error) {
    console.error('Error connecting to the database:', error.stack);
    return;
  }
  console.log('Connected to the database as id :  ', connection.threadId);
});

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

const PORT = environmentVars.port;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});