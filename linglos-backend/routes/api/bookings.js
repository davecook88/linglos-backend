const express = require('express');
const router = express.Router();

const User = require('../../models/User');
const Appointment = require('../../models/Appointment');

// @route POST api/booking/makeappointment
// @desc Creates new appointment if it doesn't exist
// @access Public
router.post("/makeappointment", (req, res) => {
  const { teacher, time, userId } = req.body;
  const startDateObj = new Date(time.start);
  const startTimeInMilliseconds = startDateObj.getTime();
  const teacherId = teacher._id;

  User.findOne({_id:userId}, (err, user) => {
    if (err) return res.status(200).json({error:"User not found"});
    let errors = {};
    let responseObj = {};
    const appointmentId = teacherId + startTimeInMilliseconds;
    Appointment.findOne({_id:appointmentId})
      .then((appointment) => {
        if (appointment) {
          const attendeeStudents = appointment.studentIds;
          attendeeStudents.push(user.id);
          appointment.studentIds = attendeeStudents;
          appointment.save()
            .then(appointment => responseObj.appointment = {message:`Appointment:  ${appointmentId} updated successfully`})
            .catch(err => errors.appointment = [err.message, err.name, err.stack]);
        } else {
          const newAppointment = new Appointment({
            _id: appointmentId,
            teacherId:teacherId,
            studentIds:[user.id],
            time:time
          });
          console.log(newAppointment);
          newAppointment.save()
            .then(appointment => responseObj.appointment = {message:`Appointment:  ${appointmentId} created successfully`})
            .catch(err => errors.appointment = [err.message, err.name, err.stack]);
        }
        let studentAppointments = user.studentAppointments;
        studentAppointments.push(appointmentId);
        user.studentAppointments = studentAppointments;
        user.save()
          .then(user => responseObj.appointment = {message:`User:  ${user.id} updated successfully`})
          .catch(err => errors.appointment = [err.message, err.name, err.stack]);
        User.findOne({_id: teacherId}, (err, teacherRecord) => {
          if (err) errors.appointment = [err.message, err.name, err.stack];
          if (teacherRecord) {
            let teacherAppointments = teacherRecord.teacherAppointments;
            teacherAppointments.push(appointmentId);
            teacherRecord.teacherAppointments = teacherAppointments;
            teacherRecord.save()
              .then(user => responseObj.appointment = {message:`User (teacher):  ${user.id} updated successfully`})
              .catch(err => errors.appointment = [err.message, err.name, err.stack]);
          } else {
            errors.teacherRecord = {message:`User (teacher): ${teacherId} not found`};
          }
          
          res.status(200).json({body:responseObj, errors:errors, });
        })
      })
      .catch(err => {
        console.log(responseObj);
        console.log(err);
        errors.general = [err.message, err.name, err.stack];
        res.status(200).json({body:responseObj, errors:errors, });
      });
      
  });
})

module.exports = router;