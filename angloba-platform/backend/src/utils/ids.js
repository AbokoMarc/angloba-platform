import { randomBytes } from "node:crypto";
export function newId(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}${randomBytes(4).toString("hex")}`;
}
