const createUser = async (userData = {}) => {
    try {
        return {
        message: "User created successfully",
        userData,
        };
    } catch (error) {
        console.error("Error creating user:", error);
        throw new Error(error.message || "Failed to create user");
    }
    };

    export default {
    createUser,
};
