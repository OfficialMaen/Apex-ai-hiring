const applyForm = document.getElementById("applyForm");
const submitBtn = document.getElementById("submitBtn");

applyForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    submitBtn.innerText = "Processing...";
    submitBtn.disabled = true;

    const applicationData = {
        name: document.getElementById("userName").value,
        email: document.getElementById("userEmail").value,
        position: document.getElementById("userPosition").value,
        experience: document.getElementById("userExperience").value
    };

    try {
        const response = await fetch('/apply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(applicationData)
        });

        const result = await response.json();

        if (response.ok) {
            alert("✅ SUCCESS: Your application was sent!");
            applyForm.reset();
        } else {
            // This will tell you if it's a Database error or an Email error
            alert("❌ SERVER ERROR: " + result.error);
        }
    } catch (err) {
        alert("❌ CONNECTION ERROR: Could not reach the server. Check Vercel logs.");
    } finally {
        submitBtn.innerText = "Submit Application";
        submitBtn.disabled = false;
    }
});
