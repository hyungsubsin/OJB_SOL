import cron from 'node-cron';
import express from 'express'
import mongoose from 'mongoose';
import {
    collectChildCareData,
    childCareInSeoul,
    childCareNearby,
    multiPolygon,
} from './src/modules/childCare';
import { connectToDatabase } from './src/modules/dbConnect';

const app = express();
const port = process.env.PORT || 3000;

// DB Connect
connectToDatabase();

// CRUD


// Batch
// cron.schedule('0 3 * * *', async () => {
cron.schedule('*/2 * * * *', async () => {
    console.log('#################################');
    console.log('###### Update Batch Start #######');
    console.log('#################################');

    await collectChildCareData();
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})

process.on('exit', () => {
    console.log('DB Close');
    mongoose.connection.close();
})