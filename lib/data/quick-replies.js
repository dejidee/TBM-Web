// lib/data/quick-replies.js
//
// Canned openers for the vendor message composer. UI copy, not data — it moved
// out of lib/mock/messages.js when that fixture was deleted, because nothing
// about it was ever fetched: clicking one inserts the text into the box.

export const QUICK_REPLIES = [
  "Checking status...",
  "Ready for pickup!",
  "Delayed shipment",
  "Request callback",
];
