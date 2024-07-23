import { connect } from 'mongoose';

export async function connectDatabase() {
    try {
        await connect('mongodb+srv://alishakhan1843:6g0n8VySIn47CKhn@cluster0.pnaz1jh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
        console.log("DataBase connected !")
    } catch (error) {
        console.log(error);
    }
}
