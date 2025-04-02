const BASE_URL = 'http://localhost:8000';

window.onload = async () => {
    await loadDashboard();
};

const loadDashboard = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/dashboard`);
        const summary = response.data;

        // อัปเดตข้อมูลใน Dashboard
        document.getElementById('totalProducts').textContent = summary.totalProducts;
        document.getElementById('totalOrders').textContent = summary.totalOrders;
        document.getElementById('totalEmployee').textContent = summary.totalEmployee;
    } catch (err) {
        console.error('Error loading dashboard: ', err)
    }

    // ให้อัพเดตไปที่ mySQL ทุก ๆ 5 วินาที
    setInterval(async () => {
        try {
            const response = await axios.get(`${BASE_URL}/dashboard`);
            const summary = response.data;

            // อัปเดตข้อมูลใน Dashboard
            document.getElementById('totalProducts').textContent = summary.totalProducts;
            document.getElementById('totalOrders').textContent = summary.totalOrders;
            document.getElementById('totalEmployee').textContent = summary.totalEmployee;
        } catch (err) {
            console.error('Error loading dashboard: ', err)
        }
    }, 5000);
} 
