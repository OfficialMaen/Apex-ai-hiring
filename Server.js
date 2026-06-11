require('dotenv').config();
const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// Initialize Supabase & Resend
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

// Serve HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Index.html'));
});

// Handle Form POST
app.post('/apply', async (req, res) => {
    const { name, email, position, experience } = req.body;

    try {
        // 1. Save to Supabase
        const { error: dbError } = await supabase
            .from('applications')
            .insert([{ name, email, position, experience }]);

        if (dbError) throw dbError;

        // 2. Send Email Notification
        // REPLACE 'YOUR_EMAIL@GMAIL.COM' with your actual Gmail address
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'maenthecopra@gmail.com', 
            subject: `New Apex AI Applicant: ${name}`,
            html: `<h3>New Application</h3>
                   <p><b>Name:</b> ${name}</p>
                   <p><b>Email:</b> ${email}</p>
                   <p><b>Position:</b> ${position}</p>
                   <p><b>Experience:</b> ${experience}</p>`
        });

        res.status(200).json({ message: "Success" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));