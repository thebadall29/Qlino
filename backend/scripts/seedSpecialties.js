const mongoose = require('mongoose');
const Specialty = require('../models/Specialty');

const specialties = [
  { name: 'Cardiology', description: 'Heart and cardiovascular system' },
  { name: 'Dermatology', description: 'Skin, hair, and nails' },
  { name: 'Pediatrics', description: 'Child healthcare' },
  { name: 'Orthopedics', description: 'Musculoskeletal system' },
  { name: 'Neurology', description: 'Nervous system disorders' },
  { name: 'Psychiatry', description: 'Mental health' },
  { name: 'Ophthalmology', description: 'Eye care' },
  { name: 'ENT', description: 'Ear, nose, and throat' },
  { name: 'Gynecology', description: 'Women\'s health' },
  { name: 'Urology', description: 'Urinary system' }
];

mongoose.connect('mongodb://localhost:27017/qlino', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  await Specialty.deleteMany({});
  await Specialty.insertMany(specialties);
  console.log('Specialties seeded successfully');
  process.exit(0);
})
.catch(error => {
  console.error('Error seeding specialties:', error);
  process.exit(1);
});