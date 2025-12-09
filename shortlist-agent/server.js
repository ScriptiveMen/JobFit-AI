import app from "./src/app.js";
import connectDB from "./src/db/db.js";

connectDB();

app.listen(3006, () => {
    console.log("Shortlist-Agent is running on port 3006");
});
