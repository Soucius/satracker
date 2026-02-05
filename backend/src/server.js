import { ENV } from "./libs/env.js";
import express from "express";
import cors from "cors";
import { connectDB } from "./libs/db.js";
import userRoutes from "./routes/user.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import supplierRoutes from "./routes/supplier.routes.js";
import expenseRoutes from "./routes/expense.routes.js";
import orderRoutes from "./routes/order.routes.js";

const app = express();
const PORT = ENV.PORT || 5000;

app.use(express.json());
app.use(cors({
    origin: ENV.CLIENT_URL,
    credentials: true,
    optionsSuccessStatus: 200
}));
app.use("/api/users", userRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/orders", orderRoutes);

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server started on: http://localhost:${PORT}`);
    });
});