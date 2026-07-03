import "reflect-metadata";
import { AppDataSource } from "../config/type-orm-config";

AppDataSource.initialize()
    .then(() => {
        console.log("Database connected");
    })
    .catch((err) => {
        console.error("Database connection failed:", err);
    });