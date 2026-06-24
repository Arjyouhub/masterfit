import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // YYYY-MM-DD
  records: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} } // studentId -> status (String or Object)
}, { timestamps: true });

export default mongoose.model('Attendance', attendanceSchema);
