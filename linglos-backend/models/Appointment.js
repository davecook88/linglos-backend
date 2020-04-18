const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const AppointmentSchema = new Schema({
  //Manually set _id as {teacher._id + starttime.getTime() - milliseconds}
  _id:{
    type: String,
    required: true
  },
  teacherId:{
    type: String,
    required: true,
  },
  studentIds:{
    type: [String],
    required: true,
  },
  time:{
    start: {
      type:Date,
      required: true
    },
    end: {
      type:Date,
      required: true
    }, 
    length: {
      type:Number,
      required: true
    }
  }
});

module.exports = Appointment = mongoose.model("appointments", AppointmentSchema);