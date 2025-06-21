import expressAsync from "express-async-handler";
import usersServices from "../services/usersServices.js";

const createUser = expressAsync(async (req, res) => {
    try {
        const response = await usersServices.createUser(req.body);
        res.json(response);
    } catch (error) {
        console.error("Error creating user:", error);
        throw new Error(error.message || "Failed to create user");
    }
});

export {
    createUser
}
