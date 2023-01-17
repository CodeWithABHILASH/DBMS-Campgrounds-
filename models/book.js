const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookSchema = new Schema({
    campid:{
        type: Schema.Types.ObjectId,
        ref: 'Campground'
    },
    userid: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    EntryDate:{
        type:Date
    },
    ExitDate:{
        type:Date
    },
    TotalBill:{
        type:Number
    }
});

module.exports = mongoose.model("Book", bookSchema);
