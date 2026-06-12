const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

module.exports = async (req, res) => {
    // 1. Check for keys immediately
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY || !process.env.RESEND_API_KEY) {
        return res.status(500).json({ error: "API Keys are missing in Vercel Settings!" });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, email, position, experience } = req.body;

    try {
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
        const resend = new Resend(process.env.RESEND_API_KEY);

        // 2. Save to Supabase (Ensure table is named 'applications')
        const { error: dbError } = await supabase
            .from('applications')
            .insert([{ name, email, position, experience }]);

        if (dbError) throw new Error("Database Error: " + dbError.message);

        // 3. Send Email Notification
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'maenthecopra@gmail.com', // <--- MAKE SURE THIS IS YOUR EMAIL
            subject: `New Application: ${name}`,
            html: `<p><b>Name:</b> ${name}</p><p><b>Pos:</b> ${position}</p><p><b>Exp:</b> ${experience}</p>`
        });

        return res.status(200).json({ message: "Success" });
    } catch (error) {
        console.error("Critical Error:", error.message);
        return res.status(500).json({ error: error.message });
    }
};
