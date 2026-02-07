require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const Lead = require('./models/Lead');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB Connection Error:', err);
    // Wait and retry for Docker composition timing
    setTimeout(connectDB, 5000);
  }
};
connectDB();

// Service Pricing (In a real app, this might come from DB, but keeping it simple as per requirement)
const SERVICES = {
  web_dev: { name: 'Web Development', price: 500 },
  seo: { name: 'SEO', price: 300 },
  smm: { name: 'Social Media Management', price: 200 }
};

// Routes
app.post('/api/quote', async (req, res) => {
  try {
    const { selection } = req.body;
    // selection: [ { id: 'web_dev', quantity: 1 }, { id: 'seo', quantity: 6 } ]

    if (!selection || !Array.isArray(selection)) {
      return res.status(400).json({ success: false, error: 'Invalid data format. Expected an array of services.' });
    }

    if (selection.length === 0) {
      return res.status(400).json({ success: false, error: 'Please select at least one service.' });
    }

    let subtotal = 0;
    const processedServices = [];

    for (const item of selection) {
      const serviceDef = SERVICES[item.id];
      if (!serviceDef) {
        return res.status(400).json({ success: false, error: `Invalid service selected: ${item.id}` });
      }

      if (typeof item.quantity !== 'number' || item.quantity < 1 || !Number.isInteger(item.quantity)) {
        return res.status(400).json({ success: false, error: `Quantity for ${serviceDef.name} must be a positive integer.` });
      }

      const itemTotal = serviceDef.price * item.quantity;
      subtotal += itemTotal;

      processedServices.push({
        id: item.id,
        name: serviceDef.name,
        price: serviceDef.price,
        quantity: item.quantity
      });
    }

    const TAX_RATE = 0.10;
    const taxAmount = subtotal * TAX_RATE;
    const grandTotal = subtotal + taxAmount;

    // Save to DB
    const newLead = new Lead({
      services: processedServices,
      totalPrice: subtotal,
      taxAmount,
      grandTotal
    });

    await newLead.save();

    res.status(201).json({
      success: true,
      data: {
        services: processedServices,
        subtotal,
        taxAmount,
        grandTotal
      }
    });

  } catch (error) {
    console.error('Error processing quote:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/health', (req, res) => res.send('API is running'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
