const nodemailer = require('nodemailer');

// Mock email service - simulates email sending without real credentials
class MockEmailService {
  constructor() {
    // Create a mock transporter
    this.transporter = nodemailer.createTransport({
      host: 'mock.smtp.com',
      port: 587,
      secure: false,
      auth: {
        user: 'mock@example.com',
        pass: 'mock-password'
      }
    });

    // Override the sendMail method to simulate email sending
    this.transporter.sendMail = this.mockSendMail.bind(this);
  }

  // Mock email sending function
  async mockSendMail(mailOptions) {
    console.log('📧 Mock Email Sent:');
    console.log('   To:', mailOptions.to);
    console.log('   Subject:', mailOptions.subject);
    console.log('   Content:', mailOptions.text ? mailOptions.text.substring(0, 100) + '...' : 'HTML content');
    console.log('   ---');
    
    // Simulate email processing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return a mock message ID
    return {
      messageId: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      response: 'Mock email sent successfully'
    };
  }

  // Send order confirmation email
  async sendOrderConfirmation(order, user) {
    const subject = `Order Confirmation - #${order.orderNumber}`;
    const text = `
Dear ${user.firstName} ${user.lastName},

Thank you for your order! Your order has been confirmed and is being processed.

Order Details:
- Order Number: ${order.orderNumber}
- Order Date: ${new Date(order.createdAt).toLocaleDateString()}
- Total Amount: $${order.totalAmount.toFixed(2)}

Order Status: ${order.status}

We'll send you another email when your order ships.

Thank you for choosing our store!

Best regards,
The eCommerce Pro Team
    `;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Order Confirmation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #667eea; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .footer { text-align: center; padding: 20px; color: #666; }
        .btn { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛒 Order Confirmation</h1>
        </div>
        <div class="content">
            <h2>Hello ${user.firstName}!</h2>
            <p>Thank you for your order! Your order has been confirmed and is being processed.</p>
            
            <div class="order-details">
                <h3>Order Details</h3>
                <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                <p><strong>Total Amount:</strong> $${order.totalAmount.toFixed(2)}</p>
                <p><strong>Status:</strong> ${order.status}</p>
            </div>
            
            <p>We'll send you another email when your order ships.</p>
            
            <p style="text-align: center;">
                <a href="#" class="btn">Track Your Order</a>
            </p>
        </div>
        <div class="footer">
            <p>Thank you for choosing our store!</p>
            <p><strong>The eCommerce Pro Team</strong></p>
        </div>
    </div>
</body>
</html>
    `;

    return this.transporter.sendMail({
      from: '"eCommerce Pro" <noreply@ecommercepro.com>',
      to: user.email,
      subject: subject,
      text: text,
      html: html
    });
  }

  // Send password reset email
  async sendPasswordReset(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const subject = 'Password Reset Request';
    const text = `
Dear ${user.firstName} ${user.lastName},

You requested a password reset for your account.

Please click the following link to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this password reset, please ignore this email.

Best regards,
The eCommerce Pro Team
    `;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Password Reset</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #667eea; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .btn { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Password Reset</h1>
        </div>
        <div class="content">
            <h2>Hello ${user.firstName}!</h2>
            <p>You requested a password reset for your account.</p>
            
            <p style="text-align: center;">
                <a href="${resetUrl}" class="btn">Reset Password</a>
            </p>
            
            <p><strong>Important:</strong> This link will expire in 1 hour.</p>
            
            <p>If you didn't request this password reset, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>Best regards,<br><strong>The eCommerce Pro Team</strong></p>
        </div>
    </div>
</body>
</html>
    `;

    return this.transporter.sendMail({
      from: '"eCommerce Pro" <noreply@ecommercepro.com>',
      to: user.email,
      subject: subject,
      text: text,
      html: html
    });
  }

  // Send welcome email
  async sendWelcomeEmail(user) {
    const subject = 'Welcome to eCommerce Pro!';
    const text = `
Dear ${user.firstName} ${user.lastName},

Welcome to eCommerce Pro! We're excited to have you as part of our community.

Your account has been successfully created and you can now:
- Browse our products
- Add items to your cart
- Complete purchases
- Track your orders
- Manage your profile

If you have any questions, feel free to contact our support team.

Happy shopping!

Best regards,
The eCommerce Pro Team
    `;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to eCommerce Pro</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #667eea; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .btn { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Welcome to eCommerce Pro!</h1>
        </div>
        <div class="content">
            <h2>Hello ${user.firstName}!</h2>
            <p>Welcome to eCommerce Pro! We're excited to have you as part of our community.</p>
            
            <p>Your account has been successfully created and you can now:</p>
            <ul>
                <li>Browse our products</li>
                <li>Add items to your cart</li>
                <li>Complete purchases</li>
                <li>Track your orders</li>
                <li>Manage your profile</li>
            </ul>
            
            <p style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="btn">Start Shopping</a>
            </p>
            
            <p>If you have any questions, feel free to contact our support team.</p>
            
            <p>Happy shopping!</p>
        </div>
        <div class="footer">
            <p>Best regards,<br><strong>The eCommerce Pro Team</strong></p>
        </div>
    </div>
</body>
</html>
    `;

    return this.transporter.sendMail({
      from: '"eCommerce Pro" <noreply@ecommercepro.com>',
      to: user.email,
      subject: subject,
      text: text,
      html: html
    });
  }

  // Send shipping confirmation
  async sendShippingConfirmation(order, user, trackingNumber) {
    const subject = `Your Order Has Shipped - #${order.orderNumber}`;
    const text = `
Dear ${user.firstName} ${user.lastName},

Great news! Your order has been shipped and is on its way to you.

Order Details:
- Order Number: ${order.orderNumber}
- Tracking Number: ${trackingNumber}
- Estimated Delivery: 3-5 business days

You can track your package using the tracking number above.

Thank you for your patience!

Best regards,
The eCommerce Pro Team
    `;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Order Shipped</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #16a34a; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .footer { text-align: center; padding: 20px; color: #666; }
        .btn { display: inline-block; padding: 12px 24px; background: #16a34a; color: white; text-decoration: none; border-radius: 6px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📦 Order Shipped!</h1>
        </div>
        <div class="content">
            <h2>Hello ${user.firstName}!</h2>
            <p>Great news! Your order has been shipped and is on its way to you.</p>
            
            <div class="order-details">
                <h3>Shipping Details</h3>
                <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
                <p><strong>Estimated Delivery:</strong> 3-5 business days</p>
            </div>
            
            <p style="text-align: center;">
                <a href="#" class="btn">Track Package</a>
            </p>
            
            <p>Thank you for your patience!</p>
        </div>
        <div class="footer">
            <p>Best regards,<br><strong>The eCommerce Pro Team</strong></p>
        </div>
    </div>
</body>
</html>
    `;

    return this.transporter.sendMail({
      from: '"eCommerce Pro" <noreply@ecommercepro.com>',
      to: user.email,
      subject: subject,
      text: text,
      html: html
    });
  }
}

module.exports = new MockEmailService();
