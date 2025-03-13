var express = require('express');
const admin=express.Router();
const mysql = require('mysql');
admin.use(express.urlencoded({extended:true}));
const fs = require('fs');
const puppeteer = require('puppeteer');
const path = require('path');
admin.get('/',function(req,res){
    res.json({message:"oke mone"})
});
admin.use(express.static('C:/Users/User/OneDrive/Desktop/node.2024/WhatsApp Image 2024-11-18 at 14.02.21_9c612d3f.jpg'));


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

// admin.put('/do')


admin.put('/update/:id',(req,res)=>{
    const userid=req.params.id;
    const{name,phone,email}=req.body;
    console.log(name);

    connection.query('update rihla set name=?,phone=?,email=? where id=? ',
    [name,phone,email,userid],(error,result)=>{
        if(error){
        
            console.error("error posting");

        }

        res.send(result);
      })

    
});
//////////////////////delete///////////////////////////////////

admin.delete('/delete/:id',(req,res)=>{
    const userid=req.params.id;
    connection.query('delete from rihla where id=?',
        [userid,],(error,result)=>{
            if(error){
                console.error("error deleleting");
          
            }

            res.json(result);
        })
    


});



admin.get('/display',(req,res)=>{
    connection.query('select * from rihla ',(error,result)=>{
        if(error){
            console.error('error in display')
        }
        res.json(result);
    })
});







admin.get('/peric/:id', async (req, res) => {
    const { id } = req.params;

    connection.query('SELECT * FROM booking WHERE id=?', [id], async (err, results) => {
        if (err) {
            console.error('Error with MySQL:', err);
            return res.status(500).send('Database error');
        }
        if (results.length === 0) {
            console.warn('No booking found', results);
            return res.status(404).send('No booking found');
        }

        const name = results[0].name;
        const Age = results[0].age;
        const place = results[0].place;
        const doctors = results[0].doctor;
        const gender = results[0].genter;
        // const address= results[0].address;
        // const phone= results[0].phone;
        


        const generatePrescription = async () => {
            try {
                // Load HTML template
                const html = fs.readFileSync('template.html','utf8');

                // Replace placeholders with actual data
                const date = new Date().toLocaleDateString();
                const filledHtml = html
                    .replace('{{patientName}}', name)
                    .replace('{{place}}', place)
                    .replace('{{gender}}', gender)
                    .replace('{{Age}}', Age)
                    .replace('{{date}}', date)
                    .replace('{{doctor}}', doctors)
                    .replace('{{doctors}}', doctors);
                    

                // Generate PDF
                const browser = await puppeteer.launch();
                const page = await browser.newPage();

                await page.setContent(filledHtml);
                const pdfPath = path.join(__dirname,` prescription-${id}.pdf`);
                await page.pdf({ path: pdfPath, format: 'A4' });

                await browser.close();
                console.log('Prescription PDF generated:', pdfPath);

                // Send the PDF for download
                // res.download(pdfPath, prescription-${id}.pdf, (err) => {
                //     if (err) {
                //         console.error('Error sending the file:', err);
                //         res.status(500).send('Error generating the prescription.');
                //     }

                //     // Optional: Delete the file after download
                //     fs.unlink(pdfPath, (unlinkErr) => {
                //         if (unlinkErr) {
                //             console.error('Error deleting the file:', unlinkErr);
                //         }
                //     });
                // });
                const pdfUrl = `/prescriptions/prescription-${id}.pdf`;
                res.json({
                    message: 'Prescription generated successfully',
                    downloadUrl: pdfUrl,
                    printUrl: pdfUrl
                });
            } catch (error) {
                console.error('Error generating prescription:', error);
                res.status(500).send('Error generating the prescription.');
            }
        };

        await generatePrescription();
    });
});
admin.use('/prescriptions', express.static(path.join(__dirname)));




            module.exports=admin;



