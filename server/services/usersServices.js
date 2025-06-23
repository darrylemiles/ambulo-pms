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

const getUsers = async (queryObj = {}) => {
  try {
    const users = {
    "users": [
        {
            "_id": "68592d9eb74b1764029fb18e",
            "userId": "8ce89274-007c-4215-b43e-9cde4dbf66cc",
            "firstName": "Darryle",
            "lastName": "Bacay",
            "emailAddress": "darryle2.bacay@example.com",
            "avatar": "https://res.cloudinary.com/demo/image/upload/sample-avatar.jpg",
            "status": "ACTIVE",
            "position": [
                {
                    "label": "Master Admin",
                    "value": "MASTER_ADMIN"
                }
            ],
            "createdAt": "2025-06-23T10:34:06.245Z",
            "updatedAt": "2025-06-23T10:34:06.245Z",
            "__v": 0
        },
        {
            "_id": "68592d9ab74b1764029fb18c",
            "userId": "1fa4a42d-2d06-40ee-aff3-052de60510f8",
            "firstName": "Darryle",
            "lastName": "Bacay",
            "emailAddress": "darryle1.bacay@example.com",
            "avatar": "https://res.cloudinary.com/demo/image/upload/sample-avatar.jpg",
            "status": "ACTIVE",
            "position": [
                {
                    "label": "Master Admin",
                    "value": "MASTER_ADMIN"
                }
            ],
            "createdAt": "2025-06-23T10:34:02.720Z",
            "updatedAt": "2025-06-23T10:34:02.720Z",
            "__v": 0
        }
    ],
    "totalPages": 2,
    "currentPage": 1,
    "totalUsers": 3
}
    return users;
  } catch (error) {
    console.error("Error getting users:", error);
    throw new Error(error.message || "Failed to get users");
  }
};

const getSingleUserById = async (userId = "") => {
  try {
    
    const user = {
            "_id": "68592d9ab74b1764029fb18c",
            "userId": "1fa4a42d-2d06-40ee-aff3-052de60510f8",
            "firstName": "Darryle",
            "lastName": "Bacay",
            "emailAddress": "darryle1.bacay@example.com",
            "avatar": "https://res.cloudinary.com/demo/image/upload/sample-avatar.jpg",
            "status": "ACTIVE",
            "position": [
                {
                    "label": "Master Admin",
                    "value": "MASTER_ADMIN"
                }
            ],
            "createdAt": "2025-06-23T10:34:02.720Z",
            "updatedAt": "2025-06-23T10:34:02.720Z",
            "__v": 0
        }


        if (!user) {
            throw new Error("[User] not found!!!!!")
        }

        return user;
  } catch (error) {
    console.error("Error getting user:", error);
    throw new Error(error.message || "Failed to get user");
  }
};

const updateSingleUserById = async (userId = "", userData = {}) => {
  try {

    

    return {
      message: `${userId} has been successfully updated!!!!!`,
      userData,
    };
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error(error.message || "Failed to update user");
  }
};

const deleteUserById = async (userId = "") => {
  try {
    const user = await getSingleUserById(userId);

    return `User with an id of ${userId} has been successfully deleted.`;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error(error.message || "Failed to delete user");
  }
};


export default {
  createUser, 
  getUsers,
  getSingleUserById,
  updateSingleUserById,
  deleteUserById
};
