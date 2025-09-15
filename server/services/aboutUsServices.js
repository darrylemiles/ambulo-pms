import conn from "./../config/db.js";

const pool = await conn();

const createAboutUs = async (aboutUsData = {}) => {
    const {
        story_section_title,
        story_content,
        mission,
        vision,
        core_values,
        homepage_about_subtitle,
        homepage_about_content,
        about_img1,
        about_img2,
        about_img3,
        about_img4
    } = aboutUsData || {};

    try {
        const newAboutUs = {
            story_section_title,
            story_content,
            mission,
            vision,
            core_values,
            homepage_about_subtitle,
            homepage_about_content,
            about_img1,
            about_img2,
            about_img3,
            about_img4
        };
        Object.keys(newAboutUs).forEach(
            (key) => newAboutUs[key] === undefined && delete newAboutUs[key]
        );

        const fields = Object.keys(newAboutUs).join(", ");
        const placeholders = Object.keys(newAboutUs).map(() => "?").join(", ");
        const values = Object.values(newAboutUs);

        const query = `INSERT INTO about_us (${fields}) VALUES (${placeholders})`;

        const [result] = await pool.query(query, values);

        return {
            message: "About Us entry created successfully!",
            aboutUsId: result.insertId,
            aboutUsData: newAboutUs
        };
    } catch (error) {
        console.error("Error creating About Us:", error);
        throw new Error(error.message || "Failed to create About Us");
    }
};

const getAboutUs = async () => {
    try {
        const query = `SELECT * FROM about_us`;
        const [rows] = await pool.query(query);

        if (rows.length === 0) return { message: "Not found", data: [] };

        return {
            message: "About Us entries retrieved successfully",
            data: rows
        };
    } catch (error) {
        console.error("Error getting About Us:", error);
        throw new Error(error.message || "Failed to get About Us");
    }
};

const updateAboutUs = async (aboutUsId = "", aboutUsData = {}) => {
    const allowedFields = [
        "story_section_title",
        "story_content",
        "mission",
        "vision",
        "core_values",
        "homepage_about_subtitle",
        "homepage_about_content",
        "about_img1",
        "about_img2",
        "about_img3",
        "about_img4"
    ];

    try {
        const [rows] = await pool.query(`SELECT * FROM about_us LIMIT 1`);
        if (rows.length === 0) throw new Error("No About Us entry found to update");
        const current = rows[0];

        const updateFields = [];
        const values = [];

        allowedFields.forEach((field) => {
            let value = aboutUsData[field];

            if (
                ["about_img1", "about_img2", "about_img3", "about_img4"].includes(field) &&
                (value === undefined || value === "" || value === null)
            ) {
                value = current[field];
            }
            if (value !== undefined) {
                updateFields.push(`${field} = ?`);
                values.push(value);
            }
        });

        if (updateFields.length === 0) {
            throw new Error("No valid fields to update");
        }

        const query = `
            UPDATE about_us
            SET ${updateFields.join(", ")}
            LIMIT 1
        `;

        const [result] = await pool.query(query, values);

        if (result.affectedRows === 0) {
            throw new Error("About Us not found or no changes made");
        }

        return {
            message: "About Us updated successfully!",
            affectedRows: result.affectedRows
        };
    } catch (error) {
        console.error("Error updating About Us:", error);
        throw new Error(error.message || "Failed to update About Us");
    }
};

export default {
    createAboutUs,
    getAboutUs,
    updateAboutUs
};