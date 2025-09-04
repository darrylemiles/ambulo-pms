// users
import userAddressesTable from "./userAddressesTable.js";
import usersTable from "./usersTable.js";
import tenantEmergencyContactsTable from "./tenantEmergencyContactsTable.js";
import tenantIdsTable from "./tenantIdsTable.js";

// tickets
import ticketsTable from "./ticketsTable.js";

//properties
import addressesTable from "./addressesTable.js";
import propertiesTable from "./propertiesTable.js";
import propertiesPicturesTable from "./propertiesPicturesTable.js";

//lease-related
import leasesTable from "./leasesTable.js";
import leaseDefaultTable from "./leaseDefaultTable.js";

//cms
import companyInfoTable from "./companyInfoTable.js";
import companyAddressTable from "./companyAddressTable.js";
import aboutUsTable from "./aboutUsTable.js";
import faqsTable from "./faqsTable.js";

const leaseDefaultValuesInserts = `
INSERT IGNORE INTO lease_default_values (setting_key, setting_value, description) VALUES
('security_deposit_months', '1', 'Default security deposit required (in months)'),
('advance_payment_months', '2', 'Default advance rent payment required (in months)'),
('payment_frequency', 'Monthly', 'Default payment frequency'),
('lease_term_months', '24', 'Minimum lease terms'),
('quarterly_tax_percentage', '3', 'Default quarterly tax'), 
('late_fee_percentage', '10', 'Late payment fee percentage'),
('grace_period_days', '10', 'Number of days after due date before late fee applies'),
('auto_termination_after_months', '2', 'Months of non-payment before termination'),
('termination_trigger_days', '61', 'Contract auto-termination [days] after 2 month nonpayment'),
('advance_payment_forfeited_on_cancel', 'true', 'Advance payment forfeited if lease is cancelled'),
('is_security_deposit_refundable', 'true', 'If security deposis can be refunded'),
('notice_before_cancel_days', '30', 'Notice period required before cancellation'),
('notice_before_renewal_days', '30', 'Notice period required before renewal'),
('rent_increase_on_renewal', '10', 'Rent increase percentage at end of lease term');
`;

const tables = async (dbConnection) => {
  const queries = [
    // users
    userAddressesTable,
    usersTable,
    tenantEmergencyContactsTable,
    tenantIdsTable,

    // tickets
    ticketsTable,

    // properties
    addressesTable,
    propertiesTable,
    propertiesPicturesTable,

    //lease-related
    leasesTable,
    leaseDefaultTable,

    //cms
    companyInfoTable,
    companyAddressTable,
    aboutUsTable,
    faqsTable,
  ];

  for (const query of queries) {
    try {
      await dbConnection.query(query);
    } catch (error) {
      console.error("Error creating table:", error);
    }
  }

  try {
    await dbConnection.query(leaseDefaultValuesInserts);
  } catch (error) {
    console.error("Error inserting default lease values:", error);
  }

};

export default tables;
