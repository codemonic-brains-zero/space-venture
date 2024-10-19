import mongoose from "mongoose";

const dbConnection = () => {
    mongoose.connect(process.env.MONGODB_URI, { dbName: "SPACE_VENTURE" })
        .then(() => console.log('Connected to MongoDB'))
        .catch(err => {
            console.error(`Error connecting to MongoDB: ${err.message}`);
            process.exit(1); // Exit process if connection fails
        });
};

export default dbConnection