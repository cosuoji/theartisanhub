import AuditLog from '../models/AuditLog.js';

export const logAction = async (actor, target, action, meta = {}) =>
  AuditLog.create({
    actor: actor._id,
    actorRole: actor.role,
    target: target?._id,
    targetModel: target?.constructor?.modelName,
    action,
    meta,
  });