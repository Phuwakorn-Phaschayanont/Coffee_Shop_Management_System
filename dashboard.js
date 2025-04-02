const BASE_URL = 'http://localhost:8000';

window.onload = async () => {
    await loadDashboard();
};

const loadDashboard = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/dashboard`);
        const summary = response.data;

        // อัปเดตข้อมูลใน Dashboard
        document.getElementById('totalProducts').textContent = summary.totalProducts; // จำนวนสินค้า
        document.getElementById('totalOrders').textContent = summary.totalOrders; // จำนวนคำสั่งซื้อ
        document.getElementById('totalEmployee').textContent = summary.totalEmployee; // จำนวนพนักงาน
    } catch (err) {
        console.error('error loading dashboard: ', err)
    }
}
