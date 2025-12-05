import app from "./src/app.js";
import connectDB from "./src/db/db.js";

connectDB();

app.listen(3005, () => {
    console.log("Job-Agent Service is running on port 3005");
});
