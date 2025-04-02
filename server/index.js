/*const http = require('http'); // Import Node.js core module

const host = 'localhost'; // Localhost
const port = 8000; // Port number

// เมื่อเปิด เว็บไปที่ http://localhost:8000/ จะเรียกใช้งาน function requireListener
const requireListener = function (req, res) {
  res.writeHead(200);
  res.end('My first server!');
}

const server = http.createServer(requireListener);
server.listen(port, host, () => {
          console.log(`Server is running on http://${host}:${port}`);
});*/

const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const cors = require('cors')
const app = express();
const port = 8000;

app.use(bodyParser.json());
app.use(cors());

let products = []
let orders = []
let bills = []
let userCafe = []

let conn = null
const initMySQL = async () => {
  conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'coffee_system',
    port: 8820
  })
}

const validatedata = (productData) => {
  let errors = []

  if (!productData.productName) {
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

const validateOrderData = (orderData) => {
  let errors = []

  if (!orderData.customer) {
    errors.push('กรุณากรอกชื่อผู้สั่งซื้อ')
  }
  if (!orderData.productName) {
    errors.push('กรุณาเลือกสินค้า')
  }
  if (!orderData.options) {
    errors.push('กรุณาเลือกตัวเลือก')
  }
  if (!orderData.quantity) {
    errors.push('กรุณากรอกจำนวน')
  }
  if (!orderData.prices) {
    errors.push('กรุณากรอกราคา')
  }
  if (!orderData.total) {
    errors.push('กรุณากรอกจำนวนเงินรวม')
  }
  if (!orderData.payment) {
    errors.push('กรุณากรอกวิธีการชำระเงิน')
  }
  return errors
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
    errors.push('กรุณากรอกตำแหน่ง')
  }
  return errors
}

/*
GET /products สำหรับ get products ทั้งหมดที่บันทึกไว้
POST /products สำหรับสร้าง products ใหม่บันทึกเข้าไป
GET /products/:productId สำหรับดึง products รายคนออกมา
PUT /products/:productId สำหรับแก้ไข products รายคน (ตาม id ที่บันทึกเข้าไป)
DELETE /products/:productId สำหรับลบ products รายคน (ตาม id ที่บันทึกเข้าไป)
*/

/*Product*/
//path: GET /products สำหรับแสดงข้อมูล product ทั้งหมดที่บันทึกไว้
app.get('/products', async (req, res) => {
  const result = await conn.query('SELECT * FROM products')
  res.json(result[0])
})

//path: POST /products ใช้สำหรับสร้างข้อมูล product ใหม่บันทึกเข้าไป
app.post('/products', async (req, res) => {

  try {
    let product = req.body;
    const errors = validatedata(product);
    if (errors.length > 0) {
      throw {
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน',
        errors: errors
      }
    }
    const result = await conn.query('INSERT INTO products SET ?', product)
    res.json({
      message: 'Create product successfully',
      data: result[0]
    })
  } catch (err) {
    const errorMessages = err.message || 'something went wrong'
    const errors = err.errors || []
    console.error('error: ', err.message)
    res.status(500).json({
      message: errorMessages,
      errors: errors
    })
  }
})

//path: GET /products/:id สำหรับดึง product รายคนออกมา
app.get('/products/:id', async (req, res) => {
  try {
    let id = req.params.id;
    const results = await conn.query('SELECT * FROM products WHERE id = ?', id)
    if (results[0].length == 0) {
      throw { statusCode: 404, message: 'product not found' }
    }
    res.json(results[0][0])
  } catch (err) {
    console.error('error: ', err.message)
    res.status(500).json({
      message: 'something went wrong',
      errorMessage: er.message
    })
  }
})

//path: PUT /products/:id ใช้สำหรับแก้ไขข้อมูล product โดยใช้ id เป็นตัวระบุ
app.put('/products/:id', async (req, res) => {

  try {
    let id = req.params.id;
    let updateProduct = req.body;
    const result = await conn.query('UPDATE products SET ? WHERE id = ?', [updateProduct, id])
    res.json({
      message: 'Update product successfully',
      data: result[0]
    })
  } catch (err) {
    console.error('error: ', err.message)
    res.status(500).json({
      message: 'something went wrong',
      errorMessage: err.message
    })
  }
})

//path: DELETE /products/:id ใช้สำหรับลบข้อมูล product โดยใช้ id เป็นตัวระบุ
app.delete('/products/:id', async (req, res) => {

  try {
    let id = req.params.id;
    const result = await conn.query('DELETE from products WHERE id = ?', id)
    res.json({
      message: 'Delete product successfully',
      data: result[0]
    })
  } catch (err) {
    console.error('error: ', err.message)
    res.status(500).json({
      message: 'something went wrong',
      errorMessage: err.message
    })
  }
})

/*
 path: GET /products สำหรับแสดงข้อมูล product เฉพาะ id, name, price
app.get('/products', async (req, res) => {
  try {
      const [rows] = await db.query('SELECT id, name, price FROM products');
      res.json(rows);
  } catch (err) {
    console.error('error: ', err.message)
    res.status(500).json({ 
      message: 'something went wrong',
      errorMessage: err.message
    })
  }
})
*/

/*Order*/
//path: GET /orders สำหรับแสดงข้อมูล order ทั้งหมดที่บันทึกไว้
app.get('/orders', async (req, res) => {
  const result = await conn.query('SELECT * FROM orders')
  res.json(result[0])
})

//path: POST /orders ใช้สำหรับสร้างข้อมูล order ใหม่บันทึกเข้าไป
app.post('/orders', async (req, res) => {

  try {
    let order = req.body;
    const errors = validateOrderData(order);
    if (errors.length > 0) {
      throw {
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน',
        errors: errors
      }
    }
    const result = await conn.query('INSERT INTO orders SET ?', order)
    res.json({
      message: 'Create order successfully',
      data: result[0]
    })
  } catch (err) {
    const errorMessages = err.message || 'something went wrong'
    const errors = err.errors || []
    console.error('error: ', err.message)
    res.status(500).json({
      message: errorMessages,
      errors: errors
    })
  }
})

//path: GET /orders/:id สำหรับดึง order รายคนออกมา
app.get('/orders/:id', async (req, res) => {
  try {
    let id = req.params.id;
    const results = await conn.query('SELECT * FROM orders WHERE id = ?', id)
    if (results[0].length == 0) {
      throw { statusCode: 404, message: 'order not found' }
    }
    res.json(results[0][0])
  } catch (err) {
    console.error('error: ', err.message)
    res.status(500).json({
      message: 'something went wrong',
      errorMessage: er.message
    })
  }
})

//path: PUT /orders/:id ใช้สำหรับแก้ไขข้อมูล order โดยใช้ id เป็นตัวระบุ
app.put('/orders/:id', async (req, res) => {

  try {
    let id = req.params.id;
    let updateOrder = req.body;
    const result = await conn.query('UPDATE orders SET ? WHERE id = ?', [updateOrder, id])
    res.json({
      message: 'Update order successfully',
      data: result[0]
    })
  } catch (err) {
    console.error('error: ', err.message)
    res.status(500).json({
      message: 'something went wrong',
      errorMessage: err.message
    })
  }
})

//path: DELETE /orders/:id ใช้สำหรับลบข้อมูล order โดยใช้ id เป็นตัวระบุ
app.delete('/orders/:id', async (req, res) => {

  try {
    let id = req.params.id;
    const result = await conn.query('DELETE from orders WHERE id = ?', id)
    res.json({
      message: 'Delete order successfully',
      data: result[0]
    })
  } catch (err) {
    console.error('error: ', err.message)
    res.status(500).json({
      message: 'something went wrong',
      errorMessage: err.message
    })
  }
})

/*Bill
//path: GET /bills สำหรับแสดงข้อมูล bill ทั้งหมดที่บันทึกไว้
app.get('/bills', async (req, res) => {
  const result = await conn.query('SELECT * FROM bills')
  res.json(result[0])
})

//path: GET /products ดึงข้อมูล products ไปใส่ใน bill
app.get('/products', async (req, res) => {
  const result = await conn.query('SELECT product, quantity, total, payment FROM products');
  res.json(result[0])
  conn.query(query, (err, results) => {
      if (err) {
          res.status(500).json({ 
            error: err.message 
          })
      } else {
          res.json(results)
      }
  })
})
*/


/*User*/
//path: GET /users สำหรับแสดงข้อมูล user ทั้งหมดที่บันทึกไว้
app.get('/userCafe', async (req, res) => {
  const result = await conn.query('SELECT * FROM userCafe')
  res.json(result[0])
})

//path: POST /users ใช้สำหรับสร้างข้อมูล order ใหม่บันทึกเข้าไป
app.post('/userCafe', async (req, res) => {

  try {
    let user = req.body;
    const errors = validateUserData(user);
    if (errors.length > 0) {
      throw {
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน',
        errors: errors
      }
    }
    const result = await conn.query('INSERT INTO userCafe SET ?', user)
    res.json({
      message: 'Create user successfully',
      data: result[0]
    })
  } catch (err) {
    const errorMessages = err.message || 'something went wrong'
    const errors = err.errors || []
    console.error('error: ', err.message)
    res.status(500).json({
      message: errorMessages,
      errors: errors
    })
  }
})

//path: GET /users/:id สำหรับดึง order รายคนออกมา
app.get('/userCafe/:id', async (req, res) => {
  try {
    let id = req.params.id;
    const results = await conn.query('SELECT * FROM userCafe WHERE id = ?', id)
    if (results[0].length == 0) {
      throw { statusCode: 404, message: 'user not found' }
    }
    res.json(results[0][0])
  } catch (err) {
    console.error('error: ', err.message)
    res.status(500).json({
      message: 'something went wrong',
      errorMessage: er.message
    })
  }
})

//path: PUT /users/:id ใช้สำหรับแก้ไขข้อมูล order โดยใช้ productId เป็นตัวระบุ
app.put('/userCafe/:id', async (req, res) => {

  try {
    let id = req.params.id;
    let updateUser = req.body;
    const result = await conn.query('UPDATE userCafe SET ? WHERE id = ?', [updateUser, id])
    res.json({
      message: 'Update user successfully',
      data: result[0]
    })
  } catch (err) {
    console.error('error: ', err.message)
    res.status(500).json({
      message: 'something went wrong',
      errorMessage: err.message
    })
  }
})

//path: DELETE /users/:id ใช้สำหรับลบข้อมูล order โดยใช้ productId เป็นตัวระบุ
app.delete('/userCafe/:id', async (req, res) => {

  try {
    let id = req.params.id;
    const result = await conn.query('DELETE from userCafe WHERE id = ?', id)
    res.json({
      message: 'Delete user successfully',
      data: result[0]
    })
  } catch (err) {
    console.error('error: ', err.message)
    res.status(500).json({
      message: 'something went wrong',
      errorMessage: err.message
    })
  }
})

//path: GET /dashboard สำหรับแสดงข้อมูลสรุปของระบบ
app.get('/dashboard', async (req, res) => {

  try {
    // จำนวนสินค้า
    const [product] = await conn.query('SELECT COUNT(*) AS totalProducts FROM products');
    // จำนวนออเดอร์
    const [order] = await conn.query('SELECT COUNT(*) AS totalOrders FROM orders');
    // จำนวนบิล
    const [user] = await conn.query('SELECT COUNT(*) AS totalEmployee FROM userCafe');

    res.status(200).json({
      totalProducts: product[0].totalProducts,
      totalOrders: order[0].totalOrders,
      totalEmployee: user[0].totalEmployee
    })
  } catch (err) {
    console.error('error: ', err.message);
    res.status(500).json({
      message: 'something went wrong',
      errorMessage: err.message
    })
  }
})

//path: POST /update-dashboard สำหรับอัปเดตข้อมูลสรุปของระบบ
app.post('/dashboard', (req, res) => {
  const { totalProducts, totalOrders, totalEmployee } = req.body;

  conn.query("UPDATE dashboard SET totalProducts = ?, totalOrders = ?, totalEmployee = ? WHERE id = 1",
    [totalProducts, totalOrders, totalEmployee],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: "Database update error" });
      } else {
        res.json({ message: "Dashboard updated successfully" });
      }
    })
})


app.listen(port, async (req, res) => {
  await initMySQL()
  console.log('Http Server is running on port' + port);
});
