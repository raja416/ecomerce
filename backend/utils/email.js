const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send email function
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || options.message
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

// Email templates
const emailTemplates = {
  // Welcome email
  welcome: (userName) => ({
    subject: 'Welcome to Our eCommerce Store!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Welcome to Our Store!</h2>
        <p>Hello ${userName},</p>
        <p>Thank you for joining our eCommerce platform. We're excited to have you as part of our community!</p>
        <p>Here's what you can do:</p>
        <ul>
          <li>Browse our extensive product catalog</li>
          <li>Create wishlists and save your favorite items</li>
          <li>Enjoy secure shopping with our payment options</li>
          <li>Track your orders in real-time</li>
        </ul>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Happy shopping!</p>
        <p>Best regards,<br>The eCommerce Team</p>
      </div>
    `
  }),

  // Email verification
  emailVerification: (verificationUrl) => ({
    subject: 'Verify Your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Verify Your Email Address</h2>
        <p>Please click the button below to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
        </div>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p>${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `
  }),

  // Password reset
  passwordReset: (resetUrl) => ({
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Reset Your Password</h2>
        <p>You requested to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #e74c3c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        </div>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p>${resetUrl}</p>
        <p>This link will expire in 10 minutes.</p>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `
  }),

  // Order confirmation
  orderConfirmation: (order) => ({
    subject: `Order Confirmation - ${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Order Confirmation</h2>
        <p>Thank you for your order! Here are your order details:</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>Order Information</h3>
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          <p><strong>Total Amount:</strong> $${order.total.toFixed(2)}</p>
          <p><strong>Status:</strong> ${order.status}</p>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>Shipping Address</h3>
          <p>${order.shippingAddress.street}</p>
          <p>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}</p>
          <p>${order.shippingAddress.country}</p>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>Order Summary</h3>
          <p><strong>Subtotal:</strong> $${order.subtotal.toFixed(2)}</p>
          <p><strong>Shipping:</strong> $${order.shippingCost.toFixed(2)}</p>
          <p><strong>Tax:</strong> $${order.taxAmount.toFixed(2)}</p>
          ${order.discountAmount > 0 ? `<p><strong>Discount:</strong> -$${order.discountAmount.toFixed(2)}</p>` : ''}
          <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
        </div>

        <p>We'll send you updates about your order status. You can also track your order in your account dashboard.</p>
        <p>Thank you for shopping with us!</p>
      </div>
    `
  }),

  // Order shipped
  orderShipped: (order) => ({
    subject: `Your Order Has Been Shipped - ${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Your Order Has Been Shipped!</h2>
        <p>Great news! Your order has been shipped and is on its way to you.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>Shipping Information</h3>
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Carrier:</strong> ${order.shippingMethod.carrier}</p>
          <p><strong>Tracking Number:</strong> ${order.shippingMethod.trackingNumber}</p>
          <p><strong>Estimated Delivery:</strong> ${order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : 'TBD'}</p>
        </div>

        <p>You can track your package using the tracking number above on the carrier's website.</p>
        <p>We'll notify you when your order is delivered.</p>
        <p>Thank you for your patience!</p>
      </div>
    `
  }),

  // Order delivered
  orderDelivered: (order) => ({
    subject: `Your Order Has Been Delivered - ${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Your Order Has Been Delivered!</h2>
        <p>Your order has been successfully delivered to your shipping address.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>Delivery Information</h3>
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Delivery Date:</strong> ${new Date(order.deliveredAt).toLocaleDateString()}</p>
          <p><strong>Delivery Address:</strong></p>
          <p>${order.shippingAddress.street}</p>
          <p>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}</p>
        </div>

        <p>We hope you love your purchase! If you have any issues or questions, please don't hesitate to contact our customer support.</p>
        <p>Don't forget to leave a review for the products you purchased - it helps other customers make informed decisions.</p>
        <p>Thank you for shopping with us!</p>
      </div>
    `
  }),

  // Low stock alert
  lowStockAlert: (product) => ({
    subject: 'Low Stock Alert',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e74c3c;">Low Stock Alert</h2>
        <p>The following product is running low on stock:</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>Product Information</h3>
          <p><strong>Product Name:</strong> ${product.name}</p>
          <p><strong>SKU:</strong> ${product.sku}</p>
          <p><strong>Current Stock:</strong> ${product.stock}</p>
          <p><strong>Low Stock Threshold:</strong> ${product.lowStockThreshold}</p>
        </div>

        <p>Please consider restocking this product to avoid stockouts.</p>
      </div>
    `
  }),

  // Newsletter subscription
  newsletterSubscription: (userName) => ({
    subject: 'Welcome to Our Newsletter!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Welcome to Our Newsletter!</h2>
        <p>Hello ${userName},</p>
        <p>Thank you for subscribing to our newsletter! You'll now receive updates about:</p>
        <ul>
          <li>New product arrivals</li>
          <li>Special offers and discounts</li>
          <li>Seasonal sales and promotions</li>
          <li>Product recommendations</li>
          <li>Customer stories and reviews</li>
        </ul>
        <p>We promise to only send you valuable content and never spam your inbox.</p>
        <p>If you ever want to unsubscribe, you can do so from your account settings.</p>
        <p>Happy shopping!</p>
        <p>Best regards,<br>The eCommerce Team</p>
      </div>
    `
  })
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
  const template = emailTemplates.welcome(user.name);
  return sendEmail({
    email: user.email,
    subject: template.subject,
    html: template.html
  });
};

// Send email verification
const sendEmailVerification = async (user, verificationUrl) => {
  const template = emailTemplates.emailVerification(verificationUrl);
  return sendEmail({
    email: user.email,
    subject: template.subject,
    html: template.html
  });
};

// Send password reset
const sendPasswordReset = async (user, resetUrl) => {
  const template = emailTemplates.passwordReset(resetUrl);
  return sendEmail({
    email: user.email,
    subject: template.subject,
    html: template.html
  });
};

// Send order confirmation
const sendOrderConfirmation = async (user, order) => {
  const template = emailTemplates.orderConfirmation(order);
  return sendEmail({
    email: user.email,
    subject: template.subject,
    html: template.html
  });
};

// Send order shipped notification
const sendOrderShipped = async (user, order) => {
  const template = emailTemplates.orderShipped(order);
  return sendEmail({
    email: user.email,
    subject: template.subject,
    html: template.html
  });
};

// Send order delivered notification
const sendOrderDelivered = async (user, order) => {
  const template = emailTemplates.orderDelivered(order);
  return sendEmail({
    email: user.email,
    subject: template.subject,
    html: template.html
  });
};

// Send low stock alert
const sendLowStockAlert = async (adminEmail, product) => {
  const template = emailTemplates.lowStockAlert(product);
  return sendEmail({
    email: adminEmail,
    subject: template.subject,
    html: template.html
  });
};

// Send newsletter subscription confirmation
const sendNewsletterSubscription = async (user) => {
  const template = emailTemplates.newsletterSubscription(user.name);
  return sendEmail({
    email: user.email,
    subject: template.subject,
    html: template.html
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendEmailVerification,
  sendPasswordReset,
  sendOrderConfirmation,
  sendOrderShipped,
  sendOrderDelivered,
  sendLowStockAlert,
  sendNewsletterSubscription,
  emailTemplates
};








