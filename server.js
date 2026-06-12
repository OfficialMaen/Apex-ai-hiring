require('dotenv').config();
const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/apply', async (req, res) => {
    const { name, email, position, experience } = req.body;

    try {
        // 1. Try saving to Supabase
        const { error: dbError } = await supabase
            .from('applications')
            .insert([{ name, email, position, experience }]);

        if (dbError) {
            return res.status(400).json({ error: "Database: " + dbError.message });
        }

        // 2. Try sending Email (but don't fail if email crashes)
        try {
            await resend.emails.send({
                from: 'onboarding@resend.dev',
                to: 'maenthecopra@gmail.com', // <--- CHECK THIS
                subject: `New Application from ${name}`,
                html: `<p>New application received for ${position}</p>`
            });
        } catch (e) {
            console.log("Email failed but data was saved to DB");
        }

        return res.status(200).json({ message: "Success" });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

module.exports = app;
