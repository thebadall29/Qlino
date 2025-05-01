import React, { useState } from 'react';

const MedicationPlan = () => {
  const [medications, setMedications] = useState([
    { id: 1, name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', notes: 'Take with food' },
    { id: 2, name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', notes: 'Take in the morning' },
    { id: 3, name: 'Vitamin D', dosage: '1000 IU', frequency: 'Once daily', notes: 'Take with meal' },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    notes: ''
  });

  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editMode) {
      setMedications(medications.map(med =>
        med.id === editId ? { ...med, ...formData } : med
      ));
      setEditMode(false);
      setEditId(null);
    } else {
      const newMedication = {
        id: medications.length + 1,
        ...formData
      };
      setMedications([...medications, newMedication]);
    }

    setFormData({ name: '', dosage: '', frequency: '', notes: '' });
  };

  const handleEdit = (medication) => {
    setEditMode(true);
    setEditId(medication.id);
    setFormData({
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      notes: medication.notes
    });
  };

  const handleDelete = (id) => {
    setMedications(medications.filter(med => med.id !== id));
  };

  return (
    <div className="section-container">
      <h2>Medication Plan</h2>

      <div className="section">
        <h3>{editMode ? 'Edit Medication' : 'Add New Medication'}</h3>
        <form onSubmit={handleSubmit} className="medication-form">
          <div className="form-group">
            <label htmlFor="name">Medication Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="dosage">Dosage</label>
            <input
              type="text"
              id="dosage"
              name="dosage"
              value={formData.dosage}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="frequency">Frequency</label>
            <input
              type="text"
              id="frequency"
              name="frequency"
              value={formData.frequency}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="2"
            />
          </div>

          <div className="form-buttons">
            <button type="submit" className="submit-button">
              {editMode ? 'Update Medication' : 'Add Medication'}
            </button>
            {editMode && (
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setEditMode(false);
                  setFormData({ name: '', dosage: '', frequency: '', notes: '' });
                }}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="section">
        <h3>Current Medications</h3>
        {medications.length === 0 ? (
          <p className="no-medications">No medications added yet.</p>
        ) : (
          <div className="medications-table-container">
            <table className="medications-table">
              <thead>
                <tr>
                  <th>Medication</th>
                  <th>Dosage</th>
                  <th>Frequency</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {medications.map(med => (
                  <tr key={med.id}>
                    <td>{med.name}</td>
                    <td>{med.dosage}</td>
                    <td>{med.frequency}</td>
                    <td>{med.notes}</td>
                    <td className="action-buttons">
                      <button className="edit-button small" onClick={() => handleEdit(med)}>Edit</button>
                      <button className="delete-button small" onClick={() => handleDelete(med.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicationPlan;
