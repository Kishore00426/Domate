
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

        // 2. Call Bookings
        console.log("Fetching bookings...");
        const bookingsRes = await fetch(`${BASE_URL}/admin/bookings`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!bookingsRes.ok) {
            const err = await bookingsRes.text();
            console.error("Bookings failed:", err);
            process.exit(1);
        }

        const bookingsData = await bookingsRes.json();
        console.log("Bookings Response Data:", JSON.stringify(bookingsData, null, 2));

    } catch (err) {
        console.error("Error:", err.message);
    }
})();
