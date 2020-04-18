const express = require('express');
const router = express.Router();

const User = require('../../models/User');
const Appointment = require('../../models/Appointment');

// @route POST api/booking/makeappointment
// @desc Creates new appointment if it doesn't exist
// @access Public
router.post("/makeappointment", (req, res) => {
  console.log(req.body);
  const { teacher, time, userId } = req.body;
  const startTimeInMilliseconds = new Date(time.start).getTime();
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
          newAppointment.save()
            .then(appointment => responseObj.appointment = {message:`Appointment:  ${appointmentId} updated successfully`})
            .catch(err => errors.appointment = err);
        } else {
          const newAppointment = new Appointment({
            _id: appointmentId,
            teacherId:teacherId,
            studentIds:[user._id],
            time:time
          });
          newAppointment.save()
            .then(appointment => responseObj.appointment = {message:`Appointment:  ${appointmentId} created successfully`})
            .catch(err => errors.appointment = err);
        }
        let studentAppointments = user.studentAppointments;
        studentAppointments.push(appointmentId);
        user.studentAppointments = studentAppointments;
        user.save()
          .then(user => responseObj.appointment = {message:`User:  ${user.id} updated successfully`})
          .catch(err => errors.appointment = err);
        User.findOne({id: teacherId}, (err, teacher) => {
          if (err) errors.appointment = err;
          let teacherAppointments = teacher.teacherAppointments;
          teacherAppointments.push(appointmentId);
          teacher.teacherAppointments = teacherAppointments;
          teacher.save()
            .then(user => responseObj.appointment = {message:`User (teacher):  ${user.id} updated successfully`})
            .catch(err => errors.appointment = err);
        })
      })
      .catch(err => res.status(200).json({body:responseObj, errors:errors, }));
      res.status(200).json({body:responseObj, errors:errors, });
  });
})

module.exports = router;