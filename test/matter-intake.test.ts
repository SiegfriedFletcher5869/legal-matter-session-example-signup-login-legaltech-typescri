import assert from "node:assert/strict";
import { intakeBody } from "../src/matter-intake.js";

const parsed = intakeBody.safeParse({ email: "client@example.com", password: "long-enough", name: "Ava", widgetRecordId: "widget-record", captchaToken: "token", matterTitle: "Lease review" });
assert.equal(parsed.success, true);
assert.equal(intakeBody.safeParse({ ...parsed.data, widgetRecordId: "" }).success, false);
assert.equal(intakeBody.safeParse({ email: "bad", password: "short", name: "", captchaToken: "", matterTitle: "" }).success, false);
console.log("matter intake validation passed");
