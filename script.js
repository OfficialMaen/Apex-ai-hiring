const applyForm = document.getElementById("applyForm");
const submitBtn = document.getElementById("submitBtn");

applyForm.addEventListener("submit", async function(event) {
    event.preventDefault();
    submitBtn.innerText = "Sending...";
    submitBtn.disabled = true;

    const applicationData = {
        name: document.getElementById("userName").value,
        email: document.getElementById("userEmail").value,
        position: document.getElementById("userPosition").value,
        experience: document.getElementById("userExperience").value
    };

    try {
        // Updated URL to point to the Vercel API folder
        const response = await fetch('/api/apply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(applicationData)
        });

        const result = await response.json();

        if (response.ok) {
            alert("✅ SUCCESS: Application Sent!");
            applyForm.reset();
        } else {
            alert("❌ SERVER ERROR: " + result.error);
        }
    } catch (err) {
        alert("❌ CONNECTION ERROR: Check your internet or Vercel logs.");
    } finally {
        submitBtn.innerText = "Submit Application";
        submitBtn.disabled = false;
    }
});
