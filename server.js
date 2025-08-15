const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const brevo = require('@getbrevo/brevo');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Initialize Brevo
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Helper function to send confirmation email
async function sendConfirmationEmail(email, name, confirmToken) {
    if (!process.env.BREVO_API_KEY || process.env.BREVO_API_KEY === 'YOUR_BREVO_API_KEY') {
        // Development mode - log confirmation link
        const confirmLink = `http://localhost:3000/pages/confirm-email.html?token=${confirmToken}`;
        console.log('\n=== EMAIL CONFIRMATION LINK ===');
        console.log(`Email: ${email}`);
        console.log(`Confirmation Link: ${confirmLink}`);
        console.log('==============================\n');
        return;
    }
    
    const confirmLink = `http://localhost:3000/pages/confirm-email.html?token=${confirmToken}`;
    
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = "Please confirm your Alphabots4All account";
    sendSmtpEmail.htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #4a90e2; margin: 0;">Alphabots4All</h1>
                <p style="color: #666; margin: 5px 0;">501(c)(3) Nonprofit Organization</p>
            </div>
            
            <h2 style="color: #333;">Welcome to our community!</h2>
            <p>Hello ${name || 'there'},</p>
            <p>Thank you for creating an account with Alphabots4All. To complete your registration and access your account, please confirm your email address.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmLink}" style="background-color: #4a90e2; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Confirm My Account</a>
            </div>
            
            <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #4a90e2; padding: 10px; background-color: #f5f5f5; border-radius: 3px;">${confirmLink}</p>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="font-size: 14px; color: #666;">This confirmation link will expire in 24 hours for security reasons.</p>
                <p style="font-size: 14px; color: #666;">If you didn't create this account, please ignore this email.</p>
                
                <div style="margin-top: 30px;">
                    <p style="margin: 0;"><strong>Alphabots4All Team</strong></p>
                    <p style="margin: 0; color: #666; font-size: 14px;">Connecting minds to STEM education</p>
                    <p style="margin: 0; color: #666; font-size: 14px;">Email: info@alphabots4all.org</p>
                </div>
            </div>
        </div>
    `;
    sendSmtpEmail.sender = { name: process.env.FROM_NAME, email: process.env.FROM_EMAIL };
    sendSmtpEmail.to = [{ email: email, name: name }];
    
    try {
        console.log(`Attempting to send confirmation email to ${email} from ${process.env.FROM_EMAIL}`);
        await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`Confirmation email sent successfully to ${email}`);
    } catch (error) {
        console.error('Failed to send confirmation email:', error.message);
        // Log the specific error details
        if (error.response) {
            console.error('Brevo API Error Response:', JSON.stringify(error.response.data, null, 2));
        }
        if (error.body) {
            console.error('Brevo API Error Body:', JSON.stringify(error.body, null, 2));
        }
        
        // In case of email sending failure, still allow user creation but log the issue
        console.log('\n=== EMAIL SENDING FAILED - FALLBACK CONFIRMATION LINK ===');
        console.log(`Email: ${email}`);
        console.log(`Confirmation Link: ${confirmLink}`);
        console.log('========================================================\n');
    }
}

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });
        
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Generate confirmation token
        const confirmToken = jwt.sign(
            { email, type: 'email_confirmation' },
            process.env.JWT_SECRET || 'default-secret-change-this',
            { expiresIn: '24h' }
        );
        
        // Create user (unconfirmed)
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                emailConfirmed: false,
                confirmToken
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true
            }
        });
        
        // Send confirmation email
        await sendConfirmationEmail(email, name, confirmToken);
        
        res.status(201).json({ 
            message: 'Account created! Please check your email to confirm your account before signing in.',
            requiresConfirmation: true,
            user
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Failed to create account' });
    }
});

app.post('/api/auth/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user
        const user = await prisma.user.findUnique({
            where: { email }
        });
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Check if email is confirmed
        if (!user.emailConfirmed) {
            return res.status(400).json({ 
                error: 'Please check your email and click the confirmation link before signing in.',
                requiresConfirmation: true
            });
        }
        
        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'default-secret-change-this',
            { expiresIn: '7d' }
        );
        
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({ error: 'Failed to sign in' });
    }
});

// Email Confirmation Route
app.post('/api/auth/confirm-email', async (req, res) => {
    try {
        const { token } = req.body;
        
        if (!token) {
            return res.status(400).json({ error: 'Confirmation token is required' });
        }
        
        // Verify confirmation token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-change-this');
        } catch (err) {
            return res.status(400).json({ error: 'Invalid or expired confirmation token' });
        }
        
        // Check if token is for email confirmation
        if (decoded.type !== 'email_confirmation') {
            return res.status(400).json({ error: 'Invalid token type' });
        }
        
        // Find and update user
        const user = await prisma.user.findUnique({
            where: { email: decoded.email }
        });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        if (user.emailConfirmed) {
            return res.json({ message: 'Email already confirmed. You can now sign in.' });
        }
        
        // Confirm the email
        await prisma.user.update({
            where: { email: decoded.email },
            data: { 
                emailConfirmed: true,
                confirmToken: null // Clear the token
            }
        });
        
        res.json({ message: 'Email confirmed successfully! You can now sign in.' });
    } catch (error) {
        console.error('Email confirmation error:', error);
        res.status(500).json({ error: 'Failed to confirm email' });
    }
});

// Helper function to send password reset email
async function sendPasswordResetEmail(email, name, resetToken) {
    if (!process.env.BREVO_API_KEY || process.env.BREVO_API_KEY === 'YOUR_BREVO_API_KEY') {
        // Development mode - log reset link
        const resetLink = `http://localhost:3000/pages/reset-password.html?token=${resetToken}`;
        console.log('\n=== PASSWORD RESET LINK ===');
        console.log(`Email: ${email}`);
        console.log(`Reset Link: ${resetLink}`);
        console.log('=========================\n');
        return;
    }
    
    const resetLink = `http://localhost:3000/pages/reset-password.html?token=${resetToken}`;
    
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = "Reset your password - Alphabots4All";
    sendSmtpEmail.htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4a90e2;">Password Reset Request</h2>
            <p>Hi ${name || 'there'},</p>
            <p>We received a request to reset your password. Click the button below to set a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="background-color: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">Reset Password</a>
            </div>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetLink}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this password reset, you can safely ignore this email.</p>
            <br>
            <p>Best regards,<br>The Alphabots4All Team</p>
        </div>
    `;
    sendSmtpEmail.sender = { name: process.env.FROM_NAME, email: process.env.FROM_EMAIL };
    sendSmtpEmail.to = [{ email: email, name: name }];
    
    await apiInstance.sendTransacEmail(sendSmtpEmail);
}

// Password Reset Routes
app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email }
        });
        
        if (!user) {
            // Don't reveal if email exists or not for security
            return res.json({ message: 'If this email exists, you will receive a reset link shortly.' });
        }
        
        // Generate reset token (valid for 1 hour)
        const resetToken = jwt.sign(
            { userId: user.id, email: user.email, type: 'password_reset' },
            process.env.JWT_SECRET || 'default-secret-change-this',
            { expiresIn: '1h' }
        );
        
        // Send password reset email
        await sendPasswordResetEmail(email, user.name, resetToken);
        
        res.json({ 
            message: 'If this email exists, you will receive a reset link shortly.'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
});

app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;
        
        if (!token || !password) {
            return res.status(400).json({ error: 'Token and password are required' });
        }
        
        // Verify reset token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-change-this');
        } catch (err) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }
        
        // Check if token is for password reset
        if (decoded.type !== 'password_reset') {
            return res.status(400).json({ error: 'Invalid token type' });
        }
        
        // Validate password
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long' });
        }
        
        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Update user password
        await prisma.user.update({
            where: { id: decoded.userId },
            data: { password: hashedPassword }
        });
        
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access denied' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET || 'default-secret-change-this', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Blog Management Routes
app.post('/api/admin/create-blog', authenticateToken, async (req, res) => {
    try {
        // Check if user is admin
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId }
        });
        
        const adminEmails = ['info@alphabots4all.org'];
        const isAdmin = adminEmails.includes(user.email) || 
                       user.name === 'alphabots4all' || 
                       user.role === 'admin';
                       
        if (!isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        const { title, content, excerpt, category, author, tags } = req.body;
        
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }
        
        // Generate filename from title (matching admin.js pattern)
        const filename = 'blog-' + title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '') + '.html';
            
        // Create blog HTML content using FTC championship template structure
        const formattedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const tagElements = (tags || []).map(tag => `<span class="tag">${tag}</span>`).join('\n                            ');
        
        const blogHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Alphabots4All</title>
    <link rel="stylesheet" href="../../styles.css">
</head>
<body>
    <canvas id="neural-bg"></canvas>
    
    <nav class="navbar">
        <div class="nav-container">
            <div class="logo">
                <svg class="logo-svg" viewBox="0 0 60 60">
                    <circle cx="20" cy="20" r="3" class="neuron"></circle>
                    <circle cx="40" cy="20" r="3" class="neuron"></circle>
                    <circle cx="30" cy="35" r="3" class="neuron"></circle>
                    <circle cx="20" cy="45" r="3" class="neuron"></circle>
                    <circle cx="40" cy="45" r="3" class="neuron"></circle>
                    <line x1="20" y1="20" x2="30" y2="35" class="synapse"></line>
                    <line x1="40" y1="20" x2="30" y2="35" class="synapse"></line>
                    <line x1="30" y1="35" x2="20" y2="45" class="synapse"></line>
                    <line x1="30" y1="35" x2="40" y2="45" class="synapse"></line>
                </svg>
                <span>Alphabots4All</span>
            </div>
            <ul class="nav-links">
                <li><a href="../../index.html" class="neural-link">Home</a></li>
                <li><a href="../about.html" class="neural-link">About</a></li>
                <li><a href="../blogs.html" class="neural-link active">Blogs</a></li>
                <li><a href="../signin.html" class="btn-signin">Sign In</a></li>
            </ul>
            <div class="hamburger">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    </nav>

    <main class="blog-post-page">
        <div class="container">
            <div class="blog-container">
                <div class="blog-nav">
                    <a href="../blogs.html" class="back-link">← Back to Blogs</a>
                </div>
                
                <article class="blog-post">
                <header class="blog-header">
                    <div class="blog-image">
                        <div class="image-placeholder">📝</div>
                    </div>
                    <div class="blog-meta">
                        <div class="blog-date">${formattedDate}</div>
                        <h1 class="blog-title">${title}</h1>
                        <div class="blog-tags">
                            ${tagElements}
                        </div>
                    </div>
                </header>
                
                <div class="blog-content">
                    ${content}
                </div>
                </article>
            </div>
        </div>
    </main>

    <footer class="footer">
        <div class="footer-content">
            <div class="footer-section">
                <h4>Alphabots4All</h4>
                <p>Connecting minds to STEM education through innovative programs and community support.</p>
                <div class="social-links">
                    <a href="#" aria-label="Facebook">FB</a>
                    <a href="#" aria-label="Twitter">TW</a>
                    <a href="#" aria-label="LinkedIn">LI</a>
                    <a href="#" aria-label="Instagram">IG</a>
                </div>
            </div>
            <div class="footer-section">
                <h4>Contact</h4>
                <p>Email: info@alphabots4all.org</p>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2024 Alphabots4All. All rights reserved. | 501(c)(3) Nonprofit Organization</p>
        </div>
    </footer>

    <script src="../../script.js"></script>
</body>
</html>`;
        
        // Save to pages/blogs folder
        const blogsDir = path.join(__dirname, 'pages', 'blogs');
        console.log('DEBUG: Blog directory path:', blogsDir);
        console.log('DEBUG: Creating file:', filename);
        if (!fs.existsSync(blogsDir)) {
            fs.mkdirSync(blogsDir, { recursive: true });
            console.log('DEBUG: Created directory:', blogsDir);
        }
        
        const filePath = path.join(blogsDir, filename);
        console.log('DEBUG: Full file path:', filePath);
        fs.writeFileSync(filePath, blogHtml);
        console.log('DEBUG: File written successfully');
        
        res.json({ 
            message: 'Blog post created successfully!',
            filename,
            path: `/pages/blogs/${filename}`
        });
    } catch (error) {
        console.error('Blog creation error:', error);
        res.status(500).json({ error: 'Failed to create blog post' });
    }
});

// API to delete blog files
app.delete('/api/admin/delete-blog/:filename', authenticateToken, async (req, res) => {
    try {
        // Check if user is admin
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId }
        });
        
        const adminEmails = ['info@alphabots4all.org'];
        const isAdmin = adminEmails.includes(user.email) || 
                       user.name === 'alphabots4all' || 
                       user.role === 'admin';
                       
        if (!isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        const { filename } = req.params;
        
        if (!filename || !filename.endsWith('.html')) {
            return res.status(400).json({ error: 'Invalid filename' });
        }
        
        const blogsDir = path.join(__dirname, 'pages', 'blogs');
        const filePath = path.join(blogsDir, filename);
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Blog post not found' });
        }
        
        // Ensure the file is within the blogs directory (security check)
        const resolvedPath = path.resolve(filePath);
        const resolvedBlogsDir = path.resolve(blogsDir);
        
        if (!resolvedPath.startsWith(resolvedBlogsDir)) {
            return res.status(400).json({ error: 'Invalid file path' });
        }
        
        // Delete the file
        fs.unlinkSync(filePath);
        console.log(`DEBUG: Deleted blog file: ${filename}`);
        
        res.json({ 
            message: 'Blog post deleted successfully',
            filename
        });
    } catch (error) {
        console.error('Blog deletion error:', error);
        res.status(500).json({ error: 'Failed to delete blog post' });
    }
});

// API to get blog files
app.get('/api/blogs', (req, res) => {
    try {
        const blogsDir = path.join(__dirname, 'pages', 'blogs');
        
        if (!fs.existsSync(blogsDir)) {
            return res.json([]);
        }
        
        const files = fs.readdirSync(blogsDir)
            .filter(file => file.endsWith('.html'))
            .map(file => {
                const filePath = path.join(blogsDir, file);
                const stats = fs.statSync(filePath);
                
                // Read the HTML file to extract metadata
                const content = fs.readFileSync(filePath, 'utf8');
                const titleMatch = content.match(/<h1 class="blog-title">(.*?)<\/h1>/) || content.match(/<title>(.*?) - Alphabots4All<\/title>/);
                const dateMatch = content.match(/<div class="blog-date">(.*?)<\/div>/);
                const tagsMatch = content.match(/<span class="tag">(.*?)<\/span>/g);
                const excerptMatch = content.match(/<div class="blog-content">\s*<p>(.*?)<\/p>/) || content.match(/<p class="event-excerpt">(.*?)<\/p>/);
                const imageMatch = content.match(/<div class="image-placeholder">(.*?)<\/div>/);
                
                return {
                    filename: file,
                    title: titleMatch ? titleMatch[1] : file.replace('.html', ''),
                    date: dateMatch ? dateMatch[1] : stats.mtime.toLocaleDateString(),
                    tags: tagsMatch ? tagsMatch.map(tag => tag.replace(/<[^>]*>/g, '')) : [],
                    excerpt: excerptMatch ? excerptMatch[1] : '',
                    image: imageMatch ? imageMatch[1] : '📝',
                    lastModified: stats.mtime
                };
            })
            .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
        
        res.json(files);
    } catch (error) {
        console.error('Blog list error:', error);
        res.status(500).json({ error: 'Failed to get blog list' });
    }
});

// Protected route example
app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true
            }
        });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// ===== EVENTS API =====

// Get all events
app.get('/api/events', async (req, res) => {
    try {
        const userId = req.query.userId; // Optional user ID to check RSVP status
        
        const events = await prisma.event.findMany({
            where: {
                date: {
                    gte: new Date() // Only future events
                }
            },
            include: {
                rsvps: true,
                payments: true,
                interests: true
            },
            orderBy: {
                date: 'asc'
            }
        });
        
        // Add attendee count and user RSVP status
        const eventsWithMetadata = events.map(event => {
            const attendeeCount = event.rsvps.length;
            const interestedCount = event.interests.length;
            const userRSVP = userId ? event.rsvps.some(rsvp => rsvp.userId === userId) : false;
            const userInterested = userId ? event.interests.some(interest => interest.userId === userId) : false;
            const userPaid = userId ? event.payments.some(payment => payment.userId === userId && payment.status === 'completed') : false;
            
            return {
                ...event,
                attendeeCount,
                interestedCount,
                userRSVP,
                userInterested,
                userPaid,
                rsvps: undefined, // Remove detailed RSVP data from response
                payments: undefined, // Remove detailed payment data from response
                interests: undefined // Remove detailed interest data from response
            };
        });
        
        res.json(eventsWithMetadata);
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

// Create new event (admin only)
app.post('/api/events', authenticateToken, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        const { title, description, date, location, price, maxAttendees, image } = req.body;
        
        if (!title || !description || !date || !location) {
            return res.status(400).json({ error: 'Title, description, date, and location are required' });
        }
        
        const event = await prisma.event.create({
            data: {
                title,
                description,
                date: new Date(date),
                location,
                price: parseFloat(price) || 0,
                maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
                image,
                createdBy: req.user.id
            }
        });
        
        res.status(201).json(event);
    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({ error: 'Failed to create event' });
    }
});

// RSVP to event
app.post('/api/events/:eventId/rsvp', authenticateToken, async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user.id;
        
        // Check if event exists
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: { rsvps: true }
        });
        
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        // Check if event is in the future
        if (new Date(event.date) <= new Date()) {
            return res.status(400).json({ error: 'Cannot RSVP to past events' });
        }
        
        // Check if already RSVP'd
        const existingRSVP = await prisma.rSVP.findUnique({
            where: {
                userId_eventId: {
                    userId,
                    eventId
                }
            }
        });
        
        if (existingRSVP) {
            return res.status(400).json({ error: 'Already RSVP\'d to this event' });
        }
        
        // Check capacity
        if (event.maxAttendees && event.rsvps.length >= event.maxAttendees) {
            return res.status(400).json({ error: 'Event is at capacity' });
        }
        
        // Create RSVP
        const rsvp = await prisma.rSVP.create({
            data: {
                userId,
                eventId
            }
        });
        
        res.status(201).json({ message: 'RSVP successful', rsvp });
    } catch (error) {
        console.error('RSVP error:', error);
        res.status(500).json({ error: 'Failed to RSVP' });
    }
});

// Cancel RSVP
app.delete('/api/events/:eventId/rsvp', authenticateToken, async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user.id;
        
        // Check if RSVP exists
        const existingRSVP = await prisma.rSVP.findUnique({
            where: {
                userId_eventId: {
                    userId,
                    eventId
                }
            }
        });
        
        if (!existingRSVP) {
            return res.status(404).json({ error: 'RSVP not found' });
        }
        
        // Delete RSVP
        await prisma.rSVP.delete({
            where: {
                userId_eventId: {
                    userId,
                    eventId
                }
            }
        });
        
        // Also delete any pending payments
        await prisma.payment.deleteMany({
            where: {
                userId,
                eventId,
                status: 'pending'
            }
        });
        
        res.json({ message: 'RSVP cancelled successfully' });
    } catch (error) {
        console.error('Cancel RSVP error:', error);
        res.status(500).json({ error: 'Failed to cancel RSVP' });
    }
});

// Mark interest in event
app.post('/api/events/:eventId/interest', authenticateToken, async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user.id;
        
        // Check if event exists
        const event = await prisma.event.findUnique({
            where: { id: eventId }
        });
        
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        // Check if already interested
        const existingInterest = await prisma.interest.findUnique({
            where: {
                userId_eventId: {
                    userId,
                    eventId
                }
            }
        });
        
        if (existingInterest) {
            return res.status(400).json({ error: 'Already marked as interested in this event' });
        }
        
        // Create interest
        const interest = await prisma.interest.create({
            data: {
                userId,
                eventId
            }
        });
        
        res.status(201).json({ message: 'Interest marked successfully', interest });
    } catch (error) {
        console.error('Interest error:', error);
        res.status(500).json({ error: 'Failed to mark interest' });
    }
});

// Remove interest in event
app.delete('/api/events/:eventId/interest', authenticateToken, async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user.id;
        
        // Check if interest exists
        const existingInterest = await prisma.interest.findUnique({
            where: {
                userId_eventId: {
                    userId,
                    eventId
                }
            }
        });
        
        if (!existingInterest) {
            return res.status(404).json({ error: 'Interest not found' });
        }
        
        // Delete interest
        await prisma.interest.delete({
            where: {
                userId_eventId: {
                    userId,
                    eventId
                }
            }
        });
        
        res.json({ message: 'Interest removed successfully' });
    } catch (error) {
        console.error('Remove interest error:', error);
        res.status(500).json({ error: 'Failed to remove interest' });
    }
});

// Get interested users for an event (admin only)
app.get('/api/events/:eventId/interested', authenticateToken, async (req, res) => {
    try {
        const { eventId } = req.params;
        
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        const interests = await prisma.interest.findMany({
            where: { eventId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        
        res.json(interests);
    } catch (error) {
        console.error('Get interested users error:', error);
        res.status(500).json({ error: 'Failed to fetch interested users' });
    }
});

// Create payment session for event
app.post('/api/events/:eventId/payment', authenticateToken, async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user.id;
        
        // Check if event exists and user has RSVP'd
        const event = await prisma.event.findUnique({
            where: { id: eventId }
        });
        
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        const rsvp = await prisma.rSVP.findUnique({
            where: {
                userId_eventId: {
                    userId,
                    eventId
                }
            }
        });
        
        if (!rsvp) {
            return res.status(400).json({ error: 'Must RSVP before paying' });
        }
        
        // Check if already paid
        const existingPayment = await prisma.payment.findUnique({
            where: {
                userId_eventId: {
                    userId,
                    eventId
                }
            }
        });
        
        if (existingPayment && existingPayment.status === 'completed') {
            return res.status(400).json({ error: 'Already paid for this event' });
        }
        
        if (event.price === 0) {
            return res.status(400).json({ error: 'This is a free event' });
        }
        
        // For now, create a pending payment record
        // In production, you would integrate with Stripe here
        const payment = await prisma.payment.create({
            data: {
                userId,
                eventId,
                amount: event.price,
                status: 'pending'
            }
        });
        
        // Mock payment URL - in production this would be a Stripe checkout URL
        const paymentUrl = `/pages/payment-success.html?payment=${payment.id}`;
        
        res.json({ paymentUrl, payment });
    } catch (error) {
        console.error('Payment creation error:', error);
        res.status(500).json({ error: 'Failed to create payment' });
    }
});

// Complete payment (webhook endpoint)
app.post('/api/payments/:paymentId/complete', async (req, res) => {
    try {
        const { paymentId } = req.params;
        
        const payment = await prisma.payment.update({
            where: { id: paymentId },
            data: { status: 'completed' }
        });
        
        res.json({ message: 'Payment completed', payment });
    } catch (error) {
        console.error('Payment completion error:', error);
        res.status(500).json({ error: 'Failed to complete payment' });
    }
});

// Create sample event for testing
app.post('/api/create-sample-event', async (req, res) => {
    try {
        // Check if sample event already exists
        const existingEvent = await prisma.event.findFirst({
            where: {
                title: 'STEM Robotics Workshop - Build Your First Robot!'
            }
        });
        
        if (existingEvent) {
            return res.json({ message: 'Sample event already exists', event: existingEvent });
        }
        
        // Create a sample event
        const sampleEvent = await prisma.event.create({
            data: {
                title: 'STEM Robotics Workshop - Build Your First Robot!',
                description: 'Join us for an exciting hands-on robotics workshop where you\'ll learn the fundamentals of programming and building robots. Perfect for beginners and intermediate learners! You\'ll work with LEGO Mindstorms EV3 and learn basic programming concepts. All materials will be provided, and you\'ll take home your creation!',
                date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
                location: 'Alphabots4All STEM Lab, 123 Innovation Drive, Fremont, CA',
                price: 25.00,
                maxAttendees: 20,
                image: '🤖',
                createdBy: 'system'
            }
        });
        
        // Create a second sample event - free event
        const freeEvent = await prisma.event.create({
            data: {
                title: 'FTC Championship Viewing Party',
                description: 'Come watch the FIRST Tech Challenge World Championship with our team! We\'ll be streaming the live competition, providing snacks, and discussing strategies. This is a great opportunity to learn about competitive robotics and meet other STEM enthusiasts.',
                date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
                location: 'Community Center, 456 Tech Boulevard, Fremont, CA',
                price: 0,
                maxAttendees: 50,
                image: '🏆',
                createdBy: 'system'
            }
        });
        
        res.json({ 
            message: 'Sample events created successfully', 
            events: [sampleEvent, freeEvent] 
        });
    } catch (error) {
        console.error('Create sample event error:', error);
        res.status(500).json({ error: 'Failed to create sample event' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});