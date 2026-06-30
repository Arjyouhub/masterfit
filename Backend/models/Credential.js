import mongoose from 'mongoose';

const credentialsSchema = new mongoose.Schema({
  configType: { type: String, required: true, default: 'main', unique: true },
  adminCredentials: { type: Map, of: String, default: {} },
  branchCredentials: {
    type: Map,
    of: new mongoose.Schema({
      username: { type: String, required: true },
      password: { type: String, required: true }
    }, { _id: false }),
    default: {}
  },
  batchCredentials: {
    type: Map,
    of: new mongoose.Schema({
      username: { type: String, required: true },
      password: { type: String, required: true }
    }, { _id: false }),
    default: {}
  },
  customBranches: { type: [String], default: [] },
  customBatches: {
    type: [new mongoose.Schema({
      id: { type: String, required: true },
      name: { type: String, required: true },
      schedule: { type: String, required: true },
      branch: { type: String },
      startTime: { type: String },
      endTime: { type: String },
      slotType: { type: String },
      status: { type: String, default: 'Active' }
    }, { _id: false })],
    default: []
  },
  monthlyFeeRate: { type: Number, default: 600 },
  admissionFeeRate: { type: Number, default: 1500 },
  coupons: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

export default mongoose.model('Credential', credentialsSchema);
