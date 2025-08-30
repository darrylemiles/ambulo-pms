import expressAsync from 'express-async-handler';
import companyDetailsServices from '../services/companyDetailsServices.js';

const createCompanyDetails = expressAsync(async (req, res) => {
  const companyData = req.body;
  const newId = await companyDetailsServices.createCompanyDetails(companyData);
  res.status(201).json({ id: newId });
});

const getCompanyDetails = expressAsync(async (req, res) => {
  const { id } = req.params;
  const company = await companyDetailsServices.getCompanyDetails(id);
  if (company) {
    res.json(company);
  } else {
    res.status(404).json({ message: "Company not found" });
  }
});

const updateCompanyDetails = expressAsync(async (req, res) => {
  const { id } = req.params;
  const companyData = req.body;
  const updated = await companyDetailsServices.updateCompanyDetails(id, companyData);
  if (updated) {
    res.json({ message: "Company updated successfully" });
  } else {
    res.status(404).json({ message: "Company not found" });
  }
});

export {
  createCompanyDetails,
  getCompanyDetails,
  updateCompanyDetails
};