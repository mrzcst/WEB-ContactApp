const express = require("express");
const sqlite3 = require("sqlite3");

const app = express();
const port = 1337;

const db = new sqlite3.Database('data.db');

db.run(`
    CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        name TEXT NOT NULL, 
        surname TEXT NOT NULL, 
        gender TEXT, 
        birthdate DATE, 
        phonenum TEXT, 
        email TEXT NOT NULL, 
        city TEXT
    )
`);

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/data', (req, res) => {
    db.all('SELECT * FROM contacts', (err, data) => {
        if (err) {
            res.status(500).json({error: err.message});
            return;
        };
        res.json(data);
    });
});

app.post('/data/add', (req, res) => {
    const {name, surname, gender, birthdate, phonenum, email, city} = req.body;

    console.log(req.body);

    if (!name || !surname || !email) {
        return res.status(400).json({error: 'Nome, Cognome ed Email sono campi obbligatori.'});
    };

    if (!isValidEmail(email)) {
        return res.status(400).json({error: 'E-mail non valido.'});
    };

    if (!isValidPhone(phonenum)) {
        return res.status(400).json({error: 'Numero di telefono non valido.'});
    };

    db.run(
        'INSERT INTO contacts (name, surname, gender, birthdate, phonenum, email, city) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, surname, gender, birthdate, phonenum, email, city],
        (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Contatto aggiunto correttamente' });
        }
    );
});

app.post('/data/update', (req, res) => {
    const {id, gender, birthdate, phonenum, city} = req.body;
    
    if (!isValidPhone(phonenum)) {
        return res.status(400).json({error: 'Numero di telefono non valido.'});
    };

    const query = `
        UPDATE contacts
        SET gender = ?, birthdate = ?, phonenum = ?, city = ?
        WHERE id = ?
    `;

    db.run(query, [gender, birthdate, phonenum, city, id], (err) => {
        if (err) {
            res.status(500).json({ error: 'Errore interno del server' });
        }
        res.json({ message: 'Contatto aggiornato con successo' });
    });
});

function isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
};
  
function isValidPhone(phone) {
    const phoneRegex = /^(\d{10})?$/;
    return phoneRegex.test(phone);
}

app.listen(port, () => {console.log(`Server in esecuzione su localhost:${port}`)});
