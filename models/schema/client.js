const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    id: String,
    clientId: String,
    clientSecret: String,
    grants: [String],
    redirectUris: [String]
});

module.exports = mongoose.model('Client', clientSchema);
