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

        // 1. ดึงข้อมูล user ที่ต้องการ edit
        try {
            const response = await axios.get(`${BASE_URL}/userCafe/${id}`)
            const user = response.data

            // 2. เราจะนำข้อมูลของ user ที่ดึงมา ใส่ใน input ที่เรามี
            let employeeDOM = document.querySelector('input[name=employee]')
            let emailDOM = document.querySelector('input[name=email]')
            let positionDOM = document.querySelector('input[name=position]')

            employeeDOM.value = user.employee
            emailDOM.value = user.email
            positionDOM.value = user.position

        } catch (err) {
            console.log('error', err)
        }
    }
}

const validateUserData = (userData) => {
    let errors = []
  
    if (!userData.employee) {
      errors.push('กรุณากรอกชื่อผู้ใช้')
    }
    if (!userData.email) {
        errors.push('กรุณากรอกอีเมล')
    }
    if (!userData.position) {
      errors.push('กรุณาเลือกตำแหน่ง')
    }
    return errors
  }

const submitData = async () => {
    let employeeDOM = document.querySelector('input[name=employee]');
    let emailDOM = document.querySelector('input[name=email]');
    let positionDOM = document.querySelector('input[name=position]');
    let messageDOM = document.getElementById('message');
    let submitButton = document.querySelector('.button');

    try {
        let userData = {
            employee: employeeDOM.value,
            email: emailDOM.value,
            position: positionDOM.value,
        }
        console.log('submitData', userData);

        const errors = validateUserData(userData)
        if (errors.length > 0) {
            // มี error
            throw {
                message: '**กรุณากรอกข้อมูลให้ครบถ้วน**',
                errors: errors 
            }
        }

        let message = 'บันทึกข้อมูลเรียบร้อย'
        if (mode == 'CREATE') {
            const response = await axios.post(`${BASE_URL}/userCafe`, userData);
            console.log('response:', response.data);
        } else {
            const response = await axios.put(`${BASE_URL}/userCafe/${selectedId}`, userData);
            message = 'แก้ไขข้อมูลเรียบร้อย'
            console.log('response:', response.data);
        }

        messageDOM.innerText = message
        messageDOM.className = 'message success';

        // ลบปุ่มส่งข้อมูลออก หลังจากบันทึกข้อมูล
        submitButton.remove();

        // เปลี่ยนหน้าไปที่ user.html หลังจากบันทึกข้อมูลเรียบร้อย
        setTimeout(() => {
            window.location.href = 'user.html'
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