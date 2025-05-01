import React, { useState } from 'react';

const AppointmentManager = () => {
  const [doctors] = useState([
    { id: 1, name: 'Dr. Sarah Johnson', specialty: 'General Practitioner' },
    { id: 2, name: 'Dr. Michael Lee', specialty: 'Internal Medicine' },
    { id: 3, name: 'Dr. Emily Rodriguez', specialty: 'Family Medicine' },
    { id: 4, name: 'Dr. David Kim', specialty: 'Cardiology' },
  ]);

  const [appointments, setAppointments] = useState([
    { id: 1, doctorId: 1, doctorName: 'Dr. Sarah Johnson', date: '2023-11-15', time: '10:00 AM' },
    { id: 2, doctorId: 3, doctorName: 'Dr. Emily Rodriguez', date: '2023-11-22', time: '2:30 PM' },
  ]);

  const [formData, setFormData] = useState({
    doctorId: '',
    date: '',
    time: '',
  });

  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedDoctor = doctors.find(doctor => doctor.id === parseInt(formData.doctorId));

    if (editMode) {
      setAppointments(appointments.map(app =>
        app.id === editId ? {
          ...app,
          doctorId: parseInt(formData.doctorId),
          doctorName: selectedDoctor ? selectedDoctor.name : '',
          date: formData.date,
          time: formData.time
        } : app
      ));
      setEditMode(false);
      setEditId(null);
    } else {
      const newAppointment = {
        id: appointments.length + 1,
        doctorId: parseInt(formData.doctorId),
        doctorName: selectedDoctor ? selectedDoctor.name : '',
        date: formData.date,
        time: formData.time
      };
      setAppointments([...appointments, newAppointment]);
    }

    setFormData({ doctorId: '', date: '', time: '' });
  };

  const handleEdit = (appointment) => {
    setEditMode(true);
    setEditId(appointment.id);
    setFormData({
      doctorId: appointment.doctorId.toString(),
      date: appointment.date,
      time: appointment.time
    });
  };

  const handleCancel = (id) => {
    setAppointments(appointments.filter(app => app.id !== id));
  };

  return (
    <div className="section-container">
      <h2>Appointment Manager</h2>

      <div className="section">
        <h3>{editMode ? 'Edit Appointment' : 'Book New Appointment'}</h3>
        <form onSubmit={handleSubmit} className="appointment-form">
          <div className="form-group">
            <label htmlFor="doctorId">Select Doctor</label>
            <select
              id="doctorId"
              name="doctorId"
              value={formData.doctorId}
              onChange={handleInputChange}
              required
            >
              <option value="">-- Select a Doctor --</option>
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} - {doctor.specialty}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="time">Time</label>
            <select
              id="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              required
            >
              <option value="">-- Select Time --</option>
              <option value="9:00 AM">9:00 AM</option>
              <option value="10:00 AM">10:00 AM</option>
              <option value="11:00 AM">11:00 AM</option>
              <option value="1:00 PM">1:00 PM</option>
              <option value="2:00 PM">2:00 PM</option>
              <option value="3:00 PM">3:00 PM</option>
              <option value="4:00 PM">4:00 PM</option>
            </select>
          </div>

          <div className="form-buttons">
            <button type="submit" className="submit-button">
              {editMode ? 'Update Appointment' : 'Book Appointment'}
            </button>
            {editMode && (
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setEditMode(false);
                  setFormData({ doctorId: '', date: '', time: '' });
                }}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="section">
        <h3>Upcoming Appointments</h3>
        {appointments.length === 0 ? (
          <p className="no-appointments">No upcoming appointments scheduled.</p>
        ) : (
          <div className="appointments-list">
            {appointments.map(app => {
              const today = new Date().toISOString().split('T')[0];
              const isUpcoming = app.date >= today;
              const appointmentDate = new Date(app.date);
              const formattedDate = appointmentDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });

              return (
                <div key={app.id} className={`appointment-card ${isUpcoming ? '' : 'past-appointment'}`}>
                  <div className="appointment-info">
                    <div className="appointment-header">
                      <h4>{app.doctorName}</h4>
                      {isUpcoming && new Date(app.date) <= new Date(new Date().setDate(new Date().getDate() + 2)) && (
                        <span className="upcoming-badge">Soon</span>
                      )}
                    </div>
                    <p className="appointment-date">{formattedDate}</p>
                    <p className="appointment-time">{app.time}</p>
                  </div>

                  <div className="appointment-actions">
                    <button className="edit-button" onClick={() => handleEdit(app)}>Edit</button>
                    <button className="cancel-appointment-button" onClick={() => handleCancel(app.id)}>Cancel</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentManager;
