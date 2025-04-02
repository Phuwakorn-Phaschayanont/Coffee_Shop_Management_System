const BASE_URL = 'http://localhost:8000'
let mode = 'CREATE' // default mode
let selectedId = ''

window.onload = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id'); // ดึง id จาก url
    console.log('id', id)
    if (id) {
        mode = 'EDIT'
        selectedId = id

        // 1. ดึงข้อมูล order ที่ต้องการ edit
        try {
            const response = await axios.get(`${BASE_URL}/orders/${id}`)
            const order = response.data

            // 2. เราจะนำข้อมูลของ order ที่ดึงมา ใส่ใน input ที่เรามี
            let customerDOM = document.querySelector('input[name=customer]')
            let nameDOM = document.getElementById('name').addEventListener('change', calculateTotal)
            let quantityDOM = document.getElementById('quantity')
            let pricesDOM = document.getElementById('prices')
            let totalDOM = document.getElementById('total')

            customerDOM.value = order.customer
            nameDOM.value = order.name
            quantityDOM.value = order.quantity
            pricesDOM.value = order.prices
            totalDOM.value = order.total

            let optionsDOMs = document.querySelectorAll('input[name=options]')

            for (let i = 0; i < optionsDOMs.length; i++) {
                if (optionsDOMs[i].value == order.options) {
                    optionsDOMs[i].checked = true
                }
            }
            let paymentDOMs = document.querySelectorAll('input[name=payment]')

            for (let i = 0; i < paymentDOMs.length; i++) {
                if (paymentDOMs[i].value == order.payment) {
                    paymentDOMs[i].checked = true
                }
            }

        } catch (err) {
            console.log('error', err)
        }
    }
}

// โหลดข้อมูล product จาก API เมื่อหน้าเว็บโหลด
window.onload = async () => {
    await loadProducts();
};

const loadProducts = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/products`);
        const products = response.data;

        const productSelect = document.getElementById('name');

        // ล้างตัวเลือกเก่าออกก่อน
        productSelect.innerHTML = '<option disabled selected>Select a product</option>';

        // เติมตัวเลือกใหม่จาก API
        products.forEach(productData => {
            const option = document.createElement('option');
            option.value = productData.name; // เก็บชื่อสินค้าใน value
            option.textContent = productData.name; // แสดงชื่อสินค้าในตัวเลือก
            option.setAttribute('data-price', productData.prices); // เก็บราคาสินค้าใน data-price
            productSelect.appendChild(option);
        });
    } catch (err) {
        console.error('Error loading products:', err);
    }
};

// ฟังก์ชันสำหรับคำนวณยอดรวม
const calculateTotal = () => {
    const productSelect = document.getElementById('name')
    const quantityInput = document.getElementById('quantity')
    const priceInput = document.getElementById('prices')
    const totalPriceInput = document.getElementById('total')

     // ดึงราคาจาก data-price ของตัวเลือกที่เลือก
    const selectedOption = productSelect.options[productSelect.selectedIndex]; // ตัวเลือกที่ถูกเลือก
    const price = parseFloat(selectedOption.getAttribute('data-price')) || 0; // ราคาสินค้า
    const quantity = parseInt(quantityInput.value) || 0 // จำนวนสินค้า

    priceInput.value = price; // อัปเดตราคาสินค้าในช่องราคา
    const totalPrice = price * quantity // คำนวณราคารวม
    totalPriceInput.value = totalPrice.toFixed(2) // แสดงราคารวมในช่อง
}


const validateOrderData = (orderData) => {
    let errors = []

    if (!orderData.customer) {
        errors.push('กรุณากรอกชื่อผู้สั่งซื้อ')
    }
    if (!orderData.name) {
        errors.push('กรุณากรอกชื่อสินค้า')
    }
    if (!orderData.options) {
        errors.push('กรุณาเลือกตัวเลือก')
    }
    if (!orderData.quantity) {
        errors.push('กรุณากรอกจำนวนสินค้า')
    }
    if (!orderData.prices) {
        errors.push('กรุณากรอกราคา')
    }
    if (!orderData.total) {
        errors.push('กรุณากรอกยอดรวม')
    }
    if (!orderData.payment) {
        errors.push('กรุณาเลือกวิธีการชำระเงิน')
    }
    return errors
}

const submitData = async () => {
    let customerDOM = document.querySelector('input[name=customer]');
    let nameDOM = document.getElementById('name');
    let optionsDOMs = document.querySelector('input[name=options]:checked') || {}
    let quantityDOM = document.getElementById('quantity');
    let pricesDOM = document.getElementById('prices');
    let totalDOM = document.getElementById('total');
    let paymentDOMs = document.querySelector('input[name=payment]:checked') || {}
    let messageDOM = document.getElementById('message');
    let submitButton = document.querySelector('.button');

    try {
        let orderData = {
            customer: customerDOM.value,
            name: nameDOM.value,
            options: optionsDOMs.value,
            quantity: quantityDOM.value,
            prices: pricesDOM.value,
            total: totalDOM.value,
            payment: paymentDOMs.value
        }
        console.log('submitData', orderData);

        const errors = validateOrderData(orderData)
        if (errors.length > 0) {
            // มี error
            throw {
                message: '**กรุณากรอกข้อมูลให้ครบถ้วน**',
                errors: errors 
            }
        }

        let message = 'บันทึกข้อมูลเรียบร้อย'
        if (mode == 'CREATE') {
            const response = await axios.post(`${BASE_URL}/orders`, orderData);
            console.log('response:', response.data);
        } else {
            const response = await axios.put(`${BASE_URL}/orders/${selectedId}`, orderData);
            message = 'แก้ไขข้อมูลเรียบร้อย'
            console.log('response:', response.data);
        }

        messageDOM.innerText = message
        messageDOM.className = 'message success';

        // ลบปุ่มส่งข้อมูลออก หลังจากบันทึกข้อมูล
        submitButton.remove();

        // เปลี่ยนหน้าไปที่ user.html หลังจากบันทึกข้อมูลเรียบร้อย
        setTimeout(() => {
            window.location.href = 'order.html'
        }, 1000); // รอ 1 วินาทีเพื่อแสดงข้อความสำเร็จ

    } catch (err) {
        console.log('error message', err.message);
        console.log('error', err.errors);

        if (err.response) {
            console.log('error:', err.response.data.message)
            err.message = err.response.data.message
            err.errors = err.response.data.errors
        }

        let htmlData = '<div>'
        htmlData += `<div> ${err.message} </div>`;
        htmlData += '<ul>'
        for (let i = 0; i < err.errors.length; i++) {
            htmlData += `<li> ${err.errors[i]} </li>`;
        }
        htmlData += '</ul>'
        htmlData += '</div>'

        messageDOM.innerHTML = htmlData
        messageDOM.className = 'message danger';
    }
}