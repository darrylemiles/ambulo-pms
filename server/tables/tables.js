// users
import usersTable from './usersTable.js';

// tickets
import ticketsTable from './ticketsTable.js';

const tables = async (dbConnection) => {
  const queries = [
    // users
    usersTable,

    // tickets
    ticketsTable

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