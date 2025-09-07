import expressAsync from "express-async-handler";
import aboutServices from "../services/aboutUsServices.js";

function extractImagePaths(files) {
    return {
        about_img1: files?.about_img1?.[0]?.path || null,
        about_img2: files?.about_img2?.[0]?.path || null,
        about_img3: files?.about_img3?.[0]?.path || null,
        about_img4: files?.about_img4?.[0]?.path || null
    };
}

const createAboutUs = expressAsync(async (req, res) => {
    try {
        const images = extractImagePaths(req.files);

        const payload = { ...req.body, ...images };

        const response = await aboutServices.createAboutUs(payload);
        res.status(201).json(response);
    } catch (error) {
        console.error("Error creating About Us:", error);
        res.status(500).json({
            message: error.message || "Failed to create About Us"
        });
    }
});

const getAboutUs = expressAsync(async (req, res) => {
    try {
        const response = await aboutServices.getAboutUs();
        res.status(200).json(response);
    } catch (error) {
        console.error("Error getting About Us:", error);
        res.status(500).json({
            message: error.message || "Failed to get About Us"
        });
    }
});

const updateAboutUs = expressAsync(async (req, res) => {
    try {
        const aboutUsId = req.params.id;
        const images = extractImagePaths(req.files);

        const payload = { ...req.body, ...images };

        const response = await aboutServices.updateAboutUs(aboutUsId, payload);
        res.status(200).json(response);
    } catch (error) {
        console.error("Error updating About Us:", error);
        res.status(500).json({
            message: error.message || "Failed to update About Us"
        });
    }
});

export {
    createAboutUs,
    getAboutUs,
    updateAboutUs
}