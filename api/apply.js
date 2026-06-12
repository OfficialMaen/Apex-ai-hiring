const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { name, email, position, experience } = req.body;

    try {
        // 1. Save to Supabase
        const { error: dbError } = await supabase
            .from('applications')
            .insert([{ name, email, position, experience }]);

        if (dbError) throw new Error("Database: " + dbError.message);

        // 2. Send Email Notification
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'maenthecopra@gmail.com', 
            subject: `🚀 New Application: ${name}`,
            html: `
                <div style="font-family: sans-serif; line-height: 1.5;">
                    <h2>New Team Application</h2>
                    <p><b>Name:</b> ${name}</p>
                    <p><b>Email Address:</b> ${email}</p> 
                    <p><b>Position:</b> ${position}</p>
                    <hr>
                    <p><b>Experience:</b></p>
                    <p>${experience}</p>
                </div>
            `
        });

        return res.status(200).json({ message: "Success" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
