import { connect } from 'mongoose';

export async function connectDatabase() {
    try {
        await connect(process.env.MONGODB_URI)
        console.log("DataBase connected !")
    } catch (error) {
        console.log(error);
    }
}
