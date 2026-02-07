const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  services: [{
    id: String,
    name: String,
    price: Number,
    quantity: Number
  }],
  totalPrice: {
    type: Number,
    required: true
  },
  taxAmount: {
    type: Number,
    required: true
  },
  grandTotal: {
    type: Number,
    required: true
  },
  userEmail: { // Optional but good for a "Lead"
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Lead', LeadSchema);
