const {Schema,model}  = require('mongoose')

const movieSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    images: [{
        type: String,
        required: true
    }],
    rating: {
        type: Number,
        required: true
    },
    genre: {
        type: [String], 
        required: true
    },
    duration: {
        type: Number, // Duration in minutes
        required: true
    },
})

module.exports = model('Movies', movieSchema)