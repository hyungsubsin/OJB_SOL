import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import { ChildCare, connectToDatabase } from './dbConnect';

const app = express();
const port = process.env.PORT || 3000;

// DB connect
connectToDatabase();

app.use(bodyParser.json());

// CREATE
app.post('/childcare', async (req, res) => {
    try {
        const childcareData = req.body;
        const newChildCare = await ChildCare.create(childcareData);
        res.status(201).json(newChildCare);
    } catch (error) {
        console.error('Error creating childcare', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    
});

// READ
app.get('/childcare/:id', async (req, res) => {
    const childcareId = req.params.id;
    const childcareData = await ChildCare.findById(childcareId);

    if (!childcareData) {
        res.status(404).json({ error: 'Data not found' });
    } else {
        res.status(200).json(childcareData);
    }
});

// UPDATE
app.put('/childcare/:id', async (req, res) => {
    const childcareId = req.params.id;
    const updatedChildcareData = req.body;
    const updatedChildCare = await ChildCare.findByIdAndUpdate(childcareId, updatedChildcareData, { new: true });

    if (!updatedChildCare) {
        res.status(404).json({ error: 'Data not found' });
    } else {
        res.status(200).json(updatedChildCare);
    }
});

// DELETE
app.delete('/childcare/:id', async (req, res) => {
    const childcareId = req.params.id;
    const deletedChildcare = await ChildCare.findByIdAndDelete(childcareId);

    if (!deletedChildcare) {
        res.status(404).json({ error: 'Data not found' });
    } else {
        res.status(204).send();
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})

process.on('exit', () => {
    console.log('DB Close');
    mongoose.connection.close();
})