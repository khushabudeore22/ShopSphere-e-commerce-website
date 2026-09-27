import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import toast from 'react-hot-toast';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please complete all form fields');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success('Thank you for reaching out! Our support team will get back to you shortly.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    }, 600);
  };

  return (
    <div className="page-container">
      <Navbar />

      <main className="main-content">
        <div className="section-header">
          <div>
            <h1 className="section-title">Contact Customer Support</h1>
            <p className="section-subtitle">We are here to answer your queries and assist with your orders</p>
          </div>
        </div>

        <div className="contact-layout">
          {/* CONTACT INFO CARD */}
          <div className="contact-info-card">
            <div>
              <span className="badge badge-warning" style={{ marginBottom: '12px' }}>
                Get In Touch
              </span>
              <h2 style={{ color: '#FFFFFF', fontSize: '1.8rem', marginTop: '8px' }}>
                We'd love to hear from you.
              </h2>
              <p style={{ marginTop: '12px', lineHeight: '1.6' }}>
                Have questions about a product, shipping times, or your order? Send us a message and our support
                representatives will assist you promptly.
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '1.05rem', marginBottom: '8px' }}>📧 Email Us</h4>
              <p style={{ fontSize: '0.95rem' }}>support@shopsphere.com</p>
              <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Response time: within 24 hours</p>
            </div>

            <div>
              <h4 style={{ fontSize: '1.05rem', marginBottom: '8px' }}>📞 Call Us</h4>
              <p style={{ fontSize: '0.95rem' }}>+91 98765 43210</p>
              <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Mon - Sat: 9:00 AM - 6:00 PM IST</p>
            </div>

            <div>
              <h4 style={{ fontSize: '1.05rem', marginBottom: '8px' }}>📍 Headquarters</h4>
              <p style={{ fontSize: '0.95rem' }}>Nashik, Maharashtra, India</p>
            </div>
          </div>

          {/* CONTACT FORM */}
          <div className="form-container">
            <h3 style={{ marginBottom: '20px', color: 'var(--dark)' }}>Send Us a Message</h3>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Your Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    placeholder="e.g. Ananya Roy"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Your Email *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Subject *</label>
                <input
                  type="text"
                  name="subject"
                  className="form-input"
                  placeholder="e.g. Order Delivery Status / Product Inquiry"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Message *</label>
                <textarea
                  name="message"
                  className="form-textarea"
                  placeholder="Please describe your query in detail..."
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '8px' }}
                disabled={submitting}
              >
                {submitting ? 'Sending Message...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
