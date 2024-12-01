const express = require('express');
const https = require('https');
const path = require('path');
const bodyParser = require('body-parser');
const { sendOtp, verifyOtp } = require('./authentication');
const fs = require('fs');

const app = express();

app.use('/', (req, res, next) => {
    res.send('Hello from SSL server');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.post('/send-otp', sendOtp);
app.post('/verify-otp', verifyOtp);


const privateKey = fs.readFileSync(path.join(__dirname, 'SSLcer', 'key.pem'), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname, 'SSLcer', 'sertfk.pem'), 'utf8');



const sslserver = https.createServer({
    key: privateKey,
    cert: certificate
}, app);

sslserver.listen(3444, () => console.log('Secure server running on port 3444'));