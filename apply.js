const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
    // Enable CORS for the button
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { name, email, position, experience } = req.body;

        // 1. Save to Supabase
        const { error: dbError } = await supabase
            .from('applications')
            .insert([{ name, email, position, experience }]);

        if (dbError) throw new Error("DB: " + dbError.message);

        // 2. Send Email
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'maenthecopra@gmail.com', // <--- Put your real email here
            subject: `New Application: ${name}`,
            html: `<p><b>Name:</b> ${name}</p><p><b>Pos:</b> ${position}</p><p><b>Exp:</b> ${experience}</p>`
        });

        return res.status(200).json({ message: "Success" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
