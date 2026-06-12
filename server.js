require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

// We ONLY handle the POST request here
app.post('/apply', async (req, res) => {
    const { name, email, position, experience } = req.body;

    try {
        const { error: dbError } = await supabase
            .from('applications')
            .insert([{ name, email, position, experience }]);

        if (dbError) throw dbError;

        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'YOUR_GMAIL@gmail.com', // <--- MAKE SURE THIS IS YOUR GMAIL
            subject: `New Application: ${name}`,
            html: `<p><b>Name:</b> ${name}</p><p><b>Pos:</b> ${position}</p><p><b>Exp:</b> ${experience}</p>`
        });

        res.status(200).json({ message: "Success" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = app;
