const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { name, email, position, experience } = req.body;

        // 1. Save to Supabase
        const { error: dbError } = await supabase
            .from('applications')
            .insert([{ name, email, position, experience }]);

        if (dbError) throw new Error("Database Error: " + dbError.message);

        // 2. Send Email Notification
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'maenthecopra@gmail.com', // <--- IMPORTANT: Update this to your Gmail
            subject: `New Application: ${name}`,
            html: `<p><b>Name:</b> ${name}</p><p><b>Pos:</b> ${position}</p><p><b>Exp:</b> ${experience}</p>`
        });

        return res.status(200).json({ message: "Success" });
    } catch (error) {
        console.error("API ERROR:", error.message);
        return res.status(500).json({ error: error.message });
    }
};
