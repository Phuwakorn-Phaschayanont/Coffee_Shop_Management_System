const BASE_URL = 'http://localhost:8000'
let mode = 'CREATE' // default mode
let selectedId = ''

window.onload = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id'); // ดึง id จาก url
    console.log('id', id)
    if (id) {
        selectedId = id

        try {
            const response = await axios.get(`${BASE_URL}/orders/${id}`)
            const order = response.data

            let customerDOM = document.querySelector('input[name=customer]')
            let productNameDOM = document.getElementById('productName').addEventListener('change', calculateTotal) //เรียกฟังก์ชันคำนวณยอดรวมเมื่อเปลี่ยนสินค้า
            let quantityDOM = document.getElementById('quantity')
            let pricesDOM = document.getElementById('prices') //
            let totalDOM = document.getElementById('total') // เรียกฟังก์ชันคำนวณยอดรวมเมื่อเปลี่ยนจำนวนสินค้า

            customerDOM.value = order.customer
            productNameDOM.value = order.productName
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

window.onload = async () => {
    await loadProducts();
};

// โหลดข้อมูลสินค้า จาก API และเติมสินค้าลงใน select
const loadProducts = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/products`); 
        const products = response.data;

        const productSelect = document.getElementById('productName'); // ตัวเลือกสินค้า

        // วนลูปผ่านสินค้าและสร้าง option แต่ละสินค้า
        products.forEach(productData => {
            const option = document.createElement('option'); // สร้างตัวเลือกใหม่
            option.value = productData.productName; // เก็บชื่อสินค้าใน value
            option.textContent = productData.productName; // แสดงชื่อสินค้าในตัวเลือก
            option.setAttribute('data-price', productData.prices); // เก็บราคาสินค้าใน data-price
            productSelect.appendChild(option); // เพิ่มตัวเลือกลงใน select
        });
    } catch (err) {
        console.error('error loading product: ', err);
    }
};

// คำนวณยอดรวมของ order โดยอิงจากราคาสินค้าและจำนวนที่เลือก
const calculateTotal = () => {
    // ดึงข้อมูลจาก select และ input 
    const productSelect = document.getElementById('productName')
    const quantityInput = document.getElementById('quantity')
    const priceInput = document.getElementById('prices')
    const totalPriceInput = document.getElementById('total')

     // ดึงราคาสินค้าที่เก็บใน data-price ของสินค้าที่ถูกเลือก
    const selectedOption = productSelect.options[productSelect.selectedIndex]; // สินค้าที่ถูกเลือก
    const price = parseFloat(selectedOption.getAttribute('data-price')) || 0; // แปลงราคาสินค้าเป็นตัวเลข
    const quantity = parseInt(quantityInput.value) || 0 // แปลงจำนวนสินค้าเป็นตัวเลข

    priceInput.value = price; // อัปเดตราคาสินค้าในช่องราคา
    const totalPrice = price * quantity // คำนวณราคารวม
    totalPriceInput.value = totalPrice.toFixed(2) // แสดงราคารวมในช่อง
}


const validateOrderData = (orderData) => {
    let errors = []

    if (!orderData.customer) {
        errors.push('กรุณากรอกชื่อผู้สั่งซื้อ')
    }
    if (!orderData.productName) {
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
    let productNameDOM = document.getElementById('productName');
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
            productName: productNameDOM.value,
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