const express = require('express');
const mysql = require('mysql');

const booking=express.Router();

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'al rihla',
});

connection.connect((error) => {
    if (error) {
        console.error('Error connecting to database');
        return;
    }
    console.log('Connected to database');
});



booking.use(express.json());
booking.use(express.urlencoded({ extended: true }));
/////////////////////////////////////BOOKING///////////////////////////////////////////////


booking.post('/booking', (req, res) => {
    const { name,phone, email, address,age,place,date,genter,doctor} = req.body;
    console.log(name, phone, email, address,age,deparment,place,date,doctor);


    connection.query('INSERT INTO booking(name,  phone, email, address,  age,  place,  genter, doctor) VALUES (?,?,?,?,?,?,?,?)', [name, phone, email, address,  age, deparment, place,genter, doctor], (error, results) => {

        if (error) {
            console.error('error booking:', error);
            return res.json({ error: 'Database error, booking failed' });
        }
        res.json({ message: 'Booking successful', data: results });
    });
});



///////////////////////////////////DELETE BOOKING/////////////////////////////////////


booking.post('/delbooking', (req, res) => {
    const { phone } = req.body;
    console.log("Phone to delete:", phone);
    

    connection.query('DELETE FROM booking WHERE phone = ?', [phone], (error, results) => {
        if (error) {
            console.error('Error deleting booking:', error);
            return res.json({ error: 'Database error, deletion failed' });
        }

        if (results.affectedRows === 0) {
            return res.json({ message: 'No booking found with this phone number' });
        }

        res.json({ message: 'Booking deleted successfully' });
    });
});

module.exports=booking;








