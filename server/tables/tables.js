// users
import usersTable from './usersTable.js';

// tickets
import ticketsTable from './ticketsTable.js';

//properties
import propertiesTable from './propertiesTable.js'
import propertiesPicturesTable from './propertiesPicturesTable.js';

const tables = async (dbConnection) => {
  const queries = [
    // users
    usersTable,

    // tickets
    ticketsTable,

    // properties
    propertiesTable,
    propertiesPicturesTable

  ];

  for (const query of queries) {
    try {
      await dbConnection.query(query);
    } catch (error) {
      console.error('Error creating table:', error);
    }
  }
};

export default tables;