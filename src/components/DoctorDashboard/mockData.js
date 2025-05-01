// Mock data for Doctor Dashboard
  
  export const mockPatients = [
    { id: 1, name: 'John Doe', age: 30, history: 'High blood pressure, Allergic to penicillin' },
    { id: 2, name: 'Jane Smith', age: 25, history: 'Diabetes Type 1, Asthma' },
    { id: 3, name: 'Ahmed Ali', age: 40, history: 'Hypertension, Migraines' }
  ];
  
  export const mockAppointments = [
    { id: 1, patientName: 'John Doe', date: new Date().toISOString().split('T')[0], time: '14:00' },
    { id: 2, patientName: 'Jane Smith', date: new Date().toISOString().split('T')[0], time: '14:30' }
  ];

  export const mockDoctorData = {
    id: "DOC001",
    name: "Dr. Ayesha Khan",
    email: "ayesha.khan@example.com",
    specialization: "Cardiologist",
    qualification: "MBBS, MD (Cardiology)",
    experience: "15 years",
    avatar: "/images/doctor-avatar.jpg",
    workingDays: {
      monday: { active: true, startTime: "09:00", endTime: "12:00" },
      tuesday: { active: true, startTime: "09:00", endTime: "17:00" },
      wednesday: { active: true, startTime: "09:00", endTime: "17:00" },
      thursday: { active: true, startTime: "09:00", endTime: "17:00" },
      friday: { active: true, startTime: "09:00", endTime: "17:00" },
      saturday: { active: false, startTime: "09:00", endTime: "17:00" },
      sunday: { active: false, startTime: "09:00", endTime: "17:00" }
    },
    treatments: [
      { id: 1, name: "General Consultation", fee: 100 },
      { id: 2, name: "ECG", fee: 150 },
      { id: 3, name: "Stress Test", fee: 200 },
      { id: 4, name: "Holter Monitoring", fee: 300 },
      { id: 5, name: "Echocardiogram", fee: 400 }
    ],
    contact: {
      phone: "+1-234-567-8900",
      address: "123 Medical Center Drive",
      city: "Healthcare City",
      state: "California",
      country: "United States",
      emergency: "+1-234-567-8911"
    },
    todaysBookings: [
      { id: 1, name: "John Doe", time: "10:00 AM", queue: 1, contact: "+1 234-567-8901", reason: "Regular checkup" },
      { id: 2, name: "Jane Smith", time: "10:30 AM", queue: 2, contact: "+1 234-567-8902", reason: "Follow-up appointment" },
      { id: 3, name: "Mike Johnson", time: "11:00 AM", queue: 3, contact: "+1 234-567-8903", reason: "Consultation" },
      { id: 4, name: "Sarah Williams", time: "11:30 AM", queue: 4, contact: "+1 234-567-8904", reason: "Test results review" },
      { id: 5, name: "David Brown", time: "12:00 PM", queue: 5, contact: "+1 234-567-8905", reason: "New patient visit" }
    ],
    about: "Dr. Ayesha Khan is a highly experienced cardiologist with over 15 years of clinical practice. She specializes in interventional cardiology and has performed over 1000 successful procedures."
  };