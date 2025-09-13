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
import leaseContractsTable from "./leaseContractsTable.js";
import leasesTable from "./leasesTable.js";
import leaseDefaultTable from "./leaseDefaultTable.js";

//cms
import companyInfoTable from "./companyInfoTable.js";
import companyAddressTable from "./companyAddressTable.js";
import aboutUsTable from "./aboutUsTable.js";
import faqsTable from "./faqsTable.js";

//payment-related
import chargesTable from "./chargesTable.js";
import paymentsTable from "./paymentsTable.js";
import paymentProofTable from "./paymentProofTable.js";

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
    leaseContractsTable,
    leasesTable,
    leaseDefaultTable,

    //cms
    companyInfoTable,
    companyAddressTable,
    aboutUsTable,
    faqsTable,

    //payment-related
    chargesTable,
    paymentsTable,
    paymentProofTable
  ];

  for (const query of queries) {
    try {
      await dbConnection.query(query);
    } catch (error) {
      console.error("Error creating table:", error);
    }
  }

};

export default tables;
