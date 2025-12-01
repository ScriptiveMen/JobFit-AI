import app from "./src/app.js";
import connectDB from "./src/db/db.js";

connectDB();

app.listen(3004, () => {
    console.log("Application service is running on port 3004");
});
