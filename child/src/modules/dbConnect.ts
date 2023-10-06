import mongoose, { ConnectOptions } from 'mongoose';

// Schema
const childCareSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: String,
    cellPhone: String,
    homePageUrl: String,
    childrenCount: Number,
    startAt: String,
    use_naver_coord: Boolean,
    address: String,
    location: {
        type: {
            type: String,
            enum: ['Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon', 'GeometryCollection'],
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true,
        },
    },
    version: Number,
},
    {
        timestamps: true,
    }
);

// Index on 'location' field
childCareSchema.index({ location: '2dsphere' })

// Model
const ChildCare = mongoose.model('child-care', childCareSchema);

// Database Connection
async function connectToDatabase() {
    try {
        await mongoose.connect('mongodb://localhost/childcareDB', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        } as ConnectOptions);
        console.log('DB connecting success');
    } catch (err) {
        console.error('DB connecting failed', err);
    }
}

export { 
    connectToDatabase,
    ChildCare,
 };