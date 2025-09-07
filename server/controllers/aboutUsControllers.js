import expressAsync from "express-async-handler";
import aboutServices from "../services/aboutUsServices.js";

const createAboutUs = expressAsync(async (req, res) => {
    const aboutUsData = req.body;
    const result = await aboutServices.createAboutUs(aboutUsData);
    res.sendStatus(201).json({ message: result });
});

const getAboutUs = expressAsync(async (req, res) => {
    const result = await aboutServices.getAboutUs();
    res.status(200).json({ message: result });
});

const updateAboutUs = expressAsync(async (req, res) => {
    const aboutUsId = req.params.id;
    const aboutUsData = req.body;
    const result = await aboutServices.updateAboutUs(aboutUsId, aboutUsData);
    res.status(200).json({ message: result });
});

export {
    createAboutUs,
    getAboutUs,
    updateAboutUs
}