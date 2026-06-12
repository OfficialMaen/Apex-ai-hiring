require('dotenv').config();
const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
const cors = require('cors');

const app = express();

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());

// This line is VERY important: It serves your CSS, Images (Logo), and JS files
// Make sure your files are in the same folder as server.js
app.use(express.static(path.join(__dirname)));

// --- INITIALIZE SERVICES ---
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

// --- ROUTES ---

// 1. Serve the Frontend (Home Page)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. Handle the Form Submission
app.post('/apply', async (req, res) => {
    const { name, email, position, experience } = req.body;

    try {
        // STEP A: Save data to Supabase
        const { error: dbError } = await supabase
            .from('applications')
            .insert([{ name, email, position, experience }]);

        if (dbError) throw dbError;

        // STEP B: Send Email via Resend
        // Change 'maenthecopra@gmail.com' to your actual email address!
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'YOUR_GMAIL@gmail.com', 
            subject: `🚀 New Applicant: ${name}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2>New Apex AI Application</h2>
                    <p><b>Name:</b> ${name}</p>
                    <p><b>Email:</b> ${email}</p>
                    <p><b>Position:</b> ${position}</p>
                    <p><b>Experience:</b></p>
                    <p style="background: #f4f4f4; padding: 10px; border-radius: 5px;">${experience}</p>
                </div>
            `
        });

        res.status(200).json({ message: "Success! Application received." });

    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// 3. Catch-all: If someone goes to a random link, show the index page
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- VERCEL EXPORT ---
// This allows Vercel to run the server
module.exports = app;

// For local testing (if you run 'node server.js' on your PC)
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server: http://localhost:${PORT}`));
}
