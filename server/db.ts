import { Client } from 'pg';

// Create a new instance of the PostgreSQL client
const client = new Client({
  host: 'localhost',        // PostgreSQL server address (usually localhost)
  port: 5432,              // Default PostgreSQL port
  user: 'postgres',        // PostgreSQL username (change if necessary)
  password: '12345678', // PostgreSQL password (change if necessary)
  database: 'my_project_db', // The name of your database
});

// Connect to the PostgreSQL database
client.connect()
  .then(() => {
    console.log('Connected to PostgreSQL database');
  })
  .catch((err) => {
    console.error('Connection error', err.stack);
  });

// Export the client so it can be used elsewhere in the application
export default client;
