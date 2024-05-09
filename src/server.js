import express from "express";
import cors from "cors";
// import { environmentVars } from "./src/config/environmentVar.js";
import UserRoutes from "./routes/user/UserRoutes.js";
import cookieParser from "cookie-parser";
import path from "path";
import { environmentVars } from "./config/environmentVar.js";
import CategoryRoutes from "./routes/user/CategoryRoutes.js";

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
  "https://vuezen.bastionex.net",
  "https://test-vuezen.bastionex.net",
  "https://admin-vuezen.bastionex.net",
];

// Use the cors middleware with specific options
app.use(
  cors({
    origin: function(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["POST", "GET", "PUT", "REQUEST", "DELETE"],
    credentials: true,
  })
);
app.get("/", async (req, res) => {
  return res.status(200).send("Hello World");
});
console.log("hello wordl");
//routes here like this => app.use('/user',userRoutes);
app.use("/api/user", UserRoutes);

app.use("/api/category", CategoryRoutes);
 

// app.use("/")
// app.use("/api/user/ui",);

//admin routes
 
// app.use("/api/admin/permission", PermissionMOduleReviewRoutes);
// app.use("/api/admin/role", AdminRoleRoutes);
// app.use("/api/admin/api_endpoint", ApiEndpointRoutes);
// app.use("/api/admin/delivery", AdminDeliveryRoutes);
// Set up routes and testing route on '/'
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// Start the server
const PORT = environmentVars.port;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
