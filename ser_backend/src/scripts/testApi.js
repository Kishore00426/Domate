
// Update with valid admin credentials if known
const ADMIN_EMAIL = "admin_debug@example.com";
const ADMIN_PASSWORD = "password123";

const BASE_URL = "http://localhost:4000/api";

(async () => {
    try {
        // 1. Login to get token
        console.log("Logging in...");
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
        });

        if (!loginRes.ok) {
            const err = await loginRes.text();
            console.error("Login failed:", err);
            process.exit(1);
        }

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log("Got token:", token ? "Yes" : "No");

        // 2. Call Stats
        console.log("Fetching stats...");
        const statsRes = await fetch(`${BASE_URL}/admin/stats`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!statsRes.ok) {
            const err = await statsRes.text();
            console.error("Stats failed:", err);
            process.exit(1);
        }

        const statsData = await statsRes.json();
        console.log("Stats Response Data:", JSON.stringify(statsData, null, 2));

    } catch (err) {
        console.error("Error:", err.message);
    }
})();
