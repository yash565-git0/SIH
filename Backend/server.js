const express = require('express');
const mongoose = require('mongoose');

const Batch = require('./batches');
const ChainOfCustody = require('./chain_of_custody');
const CollectionEvent = require('./collectionevents');
const Consumer = require('./consumers');
const ConsumerScan = require('./consumer_scans');
const Collector = require('./collectors');
const Cooperative = require('./cooperatives');
const Manufacturer = require('./manufacturers');
const Participant = require('./participants');
const ProcessingFacility = require('./processing_facilities');

const app = express();
const port = 3000;

app.use(express.json());

const dbURI = 'mongodb://localhost:27017/your-database-name';

mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});