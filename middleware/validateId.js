import { ObjectId } from "mongodb";

export function validateIdMiddleware (req, res, next, id) {
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: `Invalid ID: ${id}` });
  }
  next();
}