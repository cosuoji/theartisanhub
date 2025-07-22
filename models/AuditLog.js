import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  actor:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  actorRole:  { type: String, required: true },
  target:     { type: mongoose.Schema.Types.ObjectId, refPath: 'targetModel' },
  targetModel:{ type: String, enum: ['User', 'Artisan', 'Job', 'Review'] },
  action:     { type: String, required: true },      // e.g. "ban", "approve"
  meta:       { type: mongoose.Schema.Types.Mixed }, // extra payload
}, { timestamps: true });

export default mongoose.model('AuditLog', auditLogSchema);