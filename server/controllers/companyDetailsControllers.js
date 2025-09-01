import expressAsync from 'express-async-handler';
import companyDetailsServices from '../services/companyDetailsServices.js';

const createCompanyDetails = expressAsync(async (req, res) => {
  // Handle uploaded files
  const iconLogo = req.files?.icon_logo_url?.[0];
  const altLogo = req.files?.alt_logo_url?.[0];

  const companyData = {
    ...req.body,
    icon_logo_url: iconLogo ? `/company_logos/${iconLogo.filename}` : null,
    alt_logo_url: altLogo ? `/company_logos/${altLogo.filename}` : null,
  };

  const newId = await companyDetailsServices.createCompanyDetails(companyData);
  res.status(201).json({ id: newId });
});

const getCompanyDetails = expressAsync(async (req, res) => {
  const companies = await companyDetailsServices.getCompanyDetails();
  res.json(companies);
});



const updateCompanyDetails = expressAsync(async (req, res) => {
  const { id } = req.params;
  const iconLogo = req.files?.icon_logo_url?.[0];
  const altLogo = req.files?.alt_logo_url?.[0];

  const companyData = {
    ...req.body,
    icon_logo_url: iconLogo ? `/company_logos/${iconLogo.filename}` : req.body.icon_logo_url,
    alt_logo_url: altLogo ? `/company_logos/${altLogo.filename}` : req.body.alt_logo_url,
  };

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