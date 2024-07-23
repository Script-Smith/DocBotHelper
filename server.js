import http from 'http';
import app from "./app.js"

const server = http.createServer(app);

server.listen(3000, () => console.log("server is running on port 3000"));



// // API_KEY = AIzaSyBsRRjU0myVhrsoEikUr_TkcZw_kERd0LU
// JWT_SECRATE = "1843Arbaz1843"
// JWT_EX_TIME = "24h"
// EXPRESS_SECRATE = "Arbaz1843"
// MONGODB_URI = 'mongodb+srv://alishakhan1843:6g0n8VySIn47CKhn@cluster0.pnaz1jh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'