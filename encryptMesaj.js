const filePath = path.join(__dirname, 'SSLcer', 'key.pem');

if (fs.existsSync(filePath)) {
    console.log('Dosya mevcut:', filePath);
} else {
    console.error('Dosya bulunamadı:', filePath);
}


function encryptMessage(message) {
    try {
        const encrypted = execSync(`echo "${message}" | openssl pkeyutl -encrypt -inkey ${path.join(__dirname, 'SSLcer', 'key.pem')} -pubin`).toString('base64');
        return encrypted;
    } catch (error) {
        console.error('Şifreleme hatası:', error);
        return null;
    }
}

function decryptMessage(encryptedMessage) {
    try {
        const decrypted = execSync(`echo "${encryptedMessage}" | base64 -d | openssl rsautl -decrypt -inkey ${path.join(__dirname, 'SSLcer', 'key.pem')}`).toString();
        return decrypted;
    } catch (error) {
        console.error('Çözme hatası:', error);
        return null;
    }
}

const message = "Bu bir test mesajidir.";
console.log('Şifrelenmiş mesaj:', encryptMessage(message));
console.log('Çözülmüş mesaj:', decryptMessage(encryptMessage(message)));