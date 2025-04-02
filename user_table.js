const BASE_URL = 'http://localhost:8000'

window.onload = async () => {
    await loadData()
}

const loadData = async () => {
    console.log('user page loaded')
    //1. load user ทั้งหมด จาก api ที่เตรียมไว้
    const response = await axios.get(`${BASE_URL}/userCafe`)

    console.log(response.data)

    const userDOM = document.getElementById('user')
    //2. นำ user ทั้งหมด โหลดกลับเข้าไปใน html

    let htmlData = `<table border="1">
        <thead>
            <tr>
                <th>ID</th>
                <th>Employee Name</th>
                <th>Email</th>
                <th>Position</th>
                <th>Action</th>
            </tr>
        </thead>
    <tbody>`

    for (let i = 0; i < response.data.length; i++) {
        let userCafe = response.data[i]
        htmlData += `<tr>
            <td>${userCafe.id}</td> 
            <td>${userCafe.employee}</td>
            <td>${userCafe.email}</td>
            <td>${userCafe.position}</td>
            <td>
                <a href='register.html?id=${userCafe.id}'><button class='edit'><i class="fa-duotone fa-solid fa-pen-to-square"></i></button></a>
                <button class='delete' data-id='${userCafe.id}'><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>`
    }
    htmlData += `</tbody></table>`
    userDOM.innerHTML = htmlData

    // 3 ลบ
    const deleteDOMs = document.getElementsByClassName('delete')
    for (let i = 0; i < deleteDOMs.length; i++) {
        deleteDOMs[i].addEventListener('click', async (event) => {
            // ดึง id ของ user ที่ต้องการลบ
            const id = event.target.dataset.id
            try {
                await axios.delete(`${BASE_URL}/userCafe/${id}`)
                loadData() //recursive function = เรียกใช้ฟังกัชัน ตัวเอง 
            } catch (err) {
                console.log('error', err)
            }
        })
    }

    // 4 ค้นหา
    const filterDOM = document.getElementById('filter')
    filterDOM.addEventListener('keyup', (event) => { // keyup = เมื่อมีการพิมพ์ใน input จะทำงาน
        const filterValue = event.target.value.toLowerCase() // แปลงเป็นตัวพิมพ์เล็กทั้งหมด
        const rows = userDOM.getElementsByTagName('tr') 
        
        // ลูปผ่านข้อมูลแต่ละแถวในตาราง
        for (let i = 1; i < rows.length; i++) {
            const cells = rows[i].getElementsByTagName('td') // ดึงข้อมูลแต่ละแถวในตาราง
            let rowContainsFilterValue = false // ตัวแปรเช็คว่าแถวนี้มีค่าที่ค้นหาหรือไม่

            // ลูปผ่านข้อมูลแต่ละเซลล์ในแถว
            for (let j = 0; j < cells.length; j++) {
                if (cells[j].innerText.toLowerCase().includes(filterValue)) { // ตรวจสอบว่าแถวนี้มีค่าที่ค้นหาหรือไม่
                    rowContainsFilterValue = true
                    break
                }
            } 
            // ถ้าแถวไหนมีค่าตรงกับคำที่ค้นหาให้แสดง ถ้าไม่ใช่คำที่ค้นหาให้ซ่อน
            rows[i].style.display = rowContainsFilterValue ? '' : 'none'
        }
    })
}