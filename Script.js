const applyForm = document.getElementById("applyForm");
const submitBtn = document.getElementById("submitBtn");

applyForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    // Visual feedback
    submitBtn.innerText = "Sending...";
    submitBtn.disabled = true;

    // Collect data
    const applicationData = {
        name: document.getElementById("userName").value,
        email: document.getElementById("userEmail").value,
        position: document.getElementById("userPosition").value,
        experience: document.getElementById("userExperience").value
    };

    try {
        // Send to Node.js server
        const response = await fetch('/apply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(applicationData)
        });

        const result = await response.json();

        if (response.ok) {
            alert("✅ Application Submitted Successfully!");
            applyForm.reset();
        } else {
            alert("❌ Error: " + (result.error || "Submission failed"));
        }
    } catch (err) {
        console.error(err);
        alert("❌ Server not responding. Did you run 'node server.js'?");
    } finally {
        submitBtn.innerText = "Submit Application";
        submitBtn.disabled = false;
    }
});