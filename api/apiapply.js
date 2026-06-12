const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

module.exports = async (req, res) => {
    // 1. Check if keys exist
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY || !process.env.RESEND_API_KEY) {
        return res.status(500).json({ error: "Missing Environment Variables on Vercel Settings." });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, email, position, experience } = req.body;

    try {
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
        const resend = new Resend(process.env.RESEND_API_KEY);

        // 2. Save to Supabase
        const { error: dbError } = await supabase
            .from('applications')
            .insert([{ name, email, position, experience }]);

        if (dbError) throw new Error("Database Error: " + dbError.message);

        // 3. Send Email
        try {
            await resend.emails.send({
                from: 'onboarding@resend.dev',
                to: 'maenthecopra@gmail.com', // <--- MAKE SURE THIS IS YOUR EMAIL
                subject: `New Application: ${name}`,
                html: `<p><b>Name:</b> ${name}</p><p><b>Pos:</b> ${position}</p><p><b>Exp:</b> ${experience}</p>`
            });
        } catch (mailErr) {
            console.log("Email failed, but data saved to DB");
        }

        return res.status(200).json({ message: "Success" });
    } catch (error) {
        console.error("API Error:", error.message);
        return res.status(500).json({ error: error.message });
    }
};
