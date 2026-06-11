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

// Handle API POST
app.post('/apply', async (req, res) => {
    const { name, email, position, experience } = req.body;
    try {
        const { error: dbError } = await supabase
            .from('applications')
            .insert([{ name, email, position, experience }]);

        if (dbError) throw dbError;

        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'maenthecopra@gmail@gmail.com', // <--- IMPORTANT: Change to your email
            subject: `New Application: ${name}`,
            html: `<p><b>Name:</b> ${name}</p><p><b>Pos:</b> ${position}</p><p><b>Exp:</b> ${experience}</p>`
        });

        res.status(200).json({ message: "Success" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve HTML for any other route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

module.exports = app;
