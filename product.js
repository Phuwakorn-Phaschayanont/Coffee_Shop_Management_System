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

        // 1. ดึงข้อมูล product ที่ต้องการ edit
        try {
            const response = await axios.get(`${BASE_URL}/products/${id}`)
            const product = response.data

            // 2. เราจะนำข้อมูลของ product ที่ดึงมา ใส่ใน input ที่เรามี
            let nameDOM = document.querySelector('input[name=name]')
            let descriptionDOM = document.querySelector('textarea[name=description]')
            let pricesDOM = document.querySelector('input[name=prices]')

            nameDOM.value = product.name
            descriptionDOM.value = product.description
            pricesDOM.value = product.prices

            let categoryDOMs = document.querySelectorAll('input[name=category]')

            for (let i = 0; i < categoryDOMs.length; i++) {
                if (categoryDOMs[i].value == product.category) {
                    categoryDOMs[i].checked = true
                }
            }
        } catch (err) {
            console.log('error', err)
        }
    }
}

const validateData = (productData) => {
    let errors = []

    if (!productData.name) {
        errors.push('กรุณากรอกชื่อสินค้า')
    }
    if (!productData.category) {
        errors.push('กรุณาเลือกหมวดหมู่')
    }
    if (!productData.description) {
        errors.push('กรุณากรอกคำอธิบาย')
    }
    if (!productData.prices) {
        errors.push('กรุณากรอกราคา')
    }
    return errors
}

const submitData = async () => {
    let nameDOM = document.querySelector('input[name=name]');
    let categoryDOM = document.querySelector('input[name=category]:checked') || {}
    let descriptionDOM = document.querySelector('textarea[name=description]');
    let pricesDOM = document.querySelector('input[name=prices]');
    let messageDOM = document.getElementById('message');
    let submitButton = document.querySelector('.button');

    try {
        let productData = {
            name: nameDOM.value,
            category: categoryDOM.value,
            description: descriptionDOM.value,
            prices: pricesDOM.value
        }
        console.log('submitData', productData);

        const errors = validateData(productData)
        if (errors.length > 0) {
            // มี error
            throw {
                message: '**กรุณากรอกข้อมูลให้ครบถ้วน**',
                errors: errors 
            }
        }

        let message = 'บันทึกข้อมูลเรียบร้อย'
        if (mode == 'CREATE') {
            const response = await axios.post(`${BASE_URL}/products`, productData);
            console.log('response:', response.data);
        } else {
            const response = await axios.put(`${BASE_URL}/products/${selectedId}`, productData);
            message = 'แก้ไขข้อมูลเรียบร้อย'
            console.log('response:', response.data);
        }

        messageDOM.innerText = message
        messageDOM.className = 'message success';

        // ลบปุ่มส่งข้อมูลออก หลังจากบันทึกข้อมูล
        submitButton.remove();

        // เปลี่ยนหน้าไปที่ user.html หลังจากบันทึกข้อมูลเรียบร้อย
        setTimeout(() => {
            window.location.href = 'product.html'
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