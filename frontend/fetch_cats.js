
import axios from 'axios';

async function fetchDetails(name) {
    try {
        const url = `https://domate-backend.onrender.com/api/services/categories/${encodeURIComponent(name)}`;
        const res = await axios.get(url);
        console.log(`${name} Subcats:`, res.data.category?.subcategories?.map(s => s.name));
    } catch (error) {
        console.log(`${name} Error:`, error.message);
    }
}

async function run() {
    await fetchDetails('Cleaning');
    await fetchDetails('Mosquito & Safety Nets');
    await fetchDetails('AC Services');
    await fetchDetails('Pest Control');
    await fetchDetails('Packers and Movers');
    await fetchDetails('Painting & Waterproofing'); // Just in case
}

run();
