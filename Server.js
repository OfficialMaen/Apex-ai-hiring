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

// Serve Frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle Post
app.post('/apply', async (req, res) => {
    const { name, email, position, experience } = req.body;

    try {
        // 1. Supabase
        const { error: dbError } = await supabase
            .from('applications')
            .insert([{ name, email, position, experience }]);

        if (dbError) throw dbError;

        // 2. Resend Email
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'maenthecopra@gmail.com', // <--- CHANGE THIS TO YOUR GMAIL
            subject: `New Apex AI Applicant: ${name}`,
            html: `<h3>New Application</h3>
                   <p><b>Name:</b> ${name}</p>
                   <p><b>Email:</b> ${email}</p>
                   <p><b>Position:</b> ${position}</p>
                   <p><b>Experience:</b> ${experience}</p>`
        });

        res.status(200).json({ message: "Success" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Required for Vercel
module.exports = app;
