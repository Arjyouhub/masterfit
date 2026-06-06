import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // YYYY-MM-DD
  records: { type: Map, of: String, default: {} } // studentId -> 'present' / 'absent'
}, { timestamps: true });

export default mongoose.model('Attendance', attendanceSchema);
