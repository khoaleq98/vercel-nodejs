const express = require("express");
const app = express();
const product = require("./api/product");
const customer = require("./api/customer");

app.use(express.json({ extended: false }));

app.use("/api/sheet-qr", product);
app.use("/api/customer-info", customer);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server is running in port http://localhost:${PORT}`));
