const mongoose = require("mongoose") // requiring the mongoose package

const userSchema = new mongoose.Schema({
    // creating a schema for todo
    firstName: {
        // field1: task
        type: String, // task is a string
        required: true, // it is required
    },
    lastName: {
        type: String, // task is a string
        required: true, // it is required
    },
    active: {
        // field2: completed
        type: Boolean, // it is a boolean
        default: false, // the default is false
    },
})

module.exports = mongoose.model("User", userSchema) // creating the model from the schema