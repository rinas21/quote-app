import React, { useState, useEffect } from 'react';
import './index.css';
import ServiceCard from './components/ServiceCard';

const SERVICES_DATA = [
  { id: 'web_dev', name: 'Web Development', price: 500, type: 'one-time', label: 'Base Project Price' },
  { id: 'seo', name: 'SEO Optimization', price: 300, type: 'monthly', label: 'Per Month' },
  { id: 'smm', name: 'Social Media Management', price: 200, type: 'monthly', label: 'Per Month' }
];

function App() {
  const [selection, setSelection] = useState({});
  const [totals, setTotals] = useState({ subtotal: 0, tax: 0, total: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error'

  const handleToggleService = (id) => {
    setSelection(prev => {
      const newState = { ...prev };
      if (newState[id]) {
        delete newState[id];
      } else {
        newState[id] = 1; // Default quantity 1
      }
      return newState;
    });
    setSubmitStatus(null);
  };

  const handleQuantityChange = (id, newQty) => {
    if (newQty < 1) return;
    setSelection(prev => ({
      ...prev,
      [id]: parseInt(newQty)
    }));
  };

  useEffect(() => {
    let sub = 0;
    Object.entries(selection).forEach(([id, qty]) => {
      const service = SERVICES_DATA.find(s => s.id === id);
      if (service) {
        sub += service.price * qty;
      }
    });
    const tax = sub * 0.10;
    setTotals({
      subtotal: sub,
      tax: tax,
      total: sub + tax
    });
  }, [selection]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    const payload = {
      selection: Object.entries(selection).map(([id, qty]) => ({
        id,
        quantity: qty
      }))
    };

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setSelection({});
      } else {
        console.error('Server Error:', data);
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error(error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="app-wrapper">
      <div className="container">

        {/* Left Column: Input Selection */}
        <div className="intro-section">
          <h1>Configure Your Plan</h1>
          <p className="subtitle">
            Select the services you need to build your custom package.
            Transparent pricing, no hidden fees.
          </p>

          <div className="services-list">
            {SERVICES_DATA.map(service => (
              <ServiceCard
                key={service.id}
                service={service}
                isSelected={!!selection[service.id]}
                quantity={selection[service.id] || 1}
                onToggle={handleToggleService}
                onQuantityChange={handleQuantityChange}
              />
            ))}
          </div>
        </div>

        {/* Right Column: Summary & Action */}
        <div className="summary-card">
          <h2>Quote Summary</h2>
          <div className="summary-details">
            {Object.keys(selection).length === 0 && (
              <p className="text-secondary" style={{ fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                No services selected yet.
              </p>
            )}

            {Object.entries(selection).map(([id, qty]) => {
              const service = SERVICES_DATA.find(s => s.id === id);
              if (!service) return null;
              return (
                <div key={id} className="summary-row">
                  <span>{service.name} <span style={{ opacity: 0.7 }}>x {qty}</span></span>
                  <span>{formatCurrency(service.price * qty)}</span>
                </div>
              );
            })}

            <div className="divider"></div>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Tax (10%)</span>
              <span>{formatCurrency(totals.tax)}</span>
            </div>
            <div className="summary-row total">
              <span>Total EST</span>
              <span>{formatCurrency(totals.total)}</span>
            </div>
          </div>

          <button
            className="btn-submit"
            onClick={handleSubmit}
            disabled={totals.total === 0 || isSubmitting}
          >
            {isSubmitting ? <span className="loader"></span> : 'Send Quote Request'}
          </button>

          {submitStatus === 'success' && (
            <div className="feedback-message success">
              Request sent successfully! We'll be in touch shortly.
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="feedback-message error">
              Something went wrong. Please check your connection.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default App;
