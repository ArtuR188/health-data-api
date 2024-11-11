const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

app.post('/save-data', async (req, res) => {
    const { heartRate, bloodOxygen } = req.body;
    const userId = 1; 

    try {
        await pool.query(
            'INSERT INTO health_data (user_id, heart_rate, blood_oxygen) VALUES ($1, $2, $3)',
            [userId, JSON.stringify(heartRate), JSON.stringify(bloodOxygen)]
        );
        res.status(200).send('Data saved successfully');
    } catch (error) {
        console.error('Database Error:', error);
        res.status(500).send(`Error saving data: ${error.message}`);
    }
});

app.get('/health-data/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await pool.query(
            'SELECT heart_rate, blood_oxygen FROM health_data WHERE user_id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).send('No data found for this user');
        }

        const { heart_rate: heartRate, blood_oxygen: bloodOxygen } = result.rows[0];
        res.status(200).json({ heartRate, bloodOxygen });
    } catch (error) {
        console.error('Database Error:', error);
        res.status(500).send(`Error retrieving data: ${error.message}`);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
