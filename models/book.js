const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookSchema = new Schema({
    campid:{
        type: Schema.Types.ObjectId,
        ref: 'Campground'
    },
    authorid: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    TotalBill:{
        type:Number
    }
});

module.exports = mongoose.model("Book", bookSchema);
