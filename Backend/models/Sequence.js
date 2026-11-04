import mongoose from 'mongoose';

const sequenceSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  value: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Sequence', sequenceSchema);

