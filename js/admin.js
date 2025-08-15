// Admin Blog Post Generator
let tags = [];

// Set today's date as default
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('postDate').value = today;
});

// Tag functionality
document.getElementById('tagInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        addTag(this.value.trim());
        this.value = '';
    }
});

function addTag(tagText) {
    if (tagText && !tags.includes(tagText)) {
        tags.push(tagText);
        renderTags();
    }
}

function removeTag(tagText) {
    tags = tags.filter(tag => tag !== tagText);
    renderTags();
}

function renderTags() {
    const container = document.getElementById('tagsContainer');
    container.innerHTML = tags.map(tag => `
        <div class="tag-item">
            ${tag}
            <button type="button" class="tag-remove" onclick="removeTag('${tag}')">&times;</button>
        </div>
    `).join('');
}

// Image preview
function previewImage(input) {
    const preview = document.getElementById('imagePreview');
    const file = input.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '📷';
    }
}

// Generate filename from title
function generateFilename(title) {
    return 'event-' + title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') + '.html';
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Get month abbreviation
function getMonthAbbr(dateString) {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[date.getMonth()];
}

// Get day from date
function getDay(dateString) {
    const date = new Date(dateString);
    return date.getDate();
}

// Get year from date
function getYear(dateString) {
    const date = new Date(dateString);
    return date.getFullYear();
}

// Generate HTML template using FTC championship template structure
function generateBlogPostHTML(data) {
    const filename = generateFilename(data.title);
    const imageContent = data.emoji || '📷';
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.title} - Alphabots4All</title>
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
                <li><a href="../events.html" class="neural-link active">Events</a></li>
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
                    <a href="../events.html" class="back-link">← Back to Events</a>
                </div>
                
                <article class="blog-post">
                <header class="blog-header">
                    <div class="blog-image">
                        <div class="image-placeholder">${imageContent}</div>
                    </div>
                    <div class="blog-meta">
                        <div class="blog-date">${formatDate(data.date)}</div>
                        <h1 class="blog-title">${data.title}</h1>
                        <div class="blog-tags">
                            ${data.tags.map(tag => `<span class="tag">${tag}</span>`).join('\n                            ')}
                        </div>
                    </div>
                </header>
                
                <div class="blog-content">
                    ${data.content}
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
}

// Generate events page HTML snippet
function generateEventsHTML(data) {
    const filename = generateFilename(data.title);
    const imageContent = data.emoji || '📷';
    
    return `                    <a href="pages/blogs/${filename}" class="event-link">
                        <article class="event-post fade-in-element">
                            <div class="event-image">
                                <div class="image-placeholder">${imageContent}</div>
                            </div>
                            <div class="event-date">
                                <span class="month">${getMonthAbbr(data.date)}</span>
                                <span class="day">${getDay(data.date)}</span>
                                <span class="year">${getYear(data.date)}</span>
                            </div>
                            <div class="event-content">
                                <h3 class="event-title">${data.title}</h3>
                                <p class="event-excerpt">${data.excerpt}</p>
                                <div class="event-tags">
                                    ${data.tags.map(tag => `<span class="tag">${tag}</span>`).join('\n                                    ')}
                                </div>
                            </div>
                        </article>
                    </a>`;
}

// Form submission
document.getElementById('blogForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        title: document.getElementById('postTitle').value,
        date: document.getElementById('postDate').value,
        emoji: document.getElementById('postEmoji').value || '📄',
        excerpt: document.getElementById('postExcerpt').value,
        content: document.getElementById('postContent').value,
        tags: tags
    };
    
    if (!formData.title || !formData.excerpt || !formData.content) {
        alert('Please fill in all required fields!');
        return;
    }
    
    // Show loading state
    const submitBtn = document.querySelector('.btn-admin[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Creating Blog Post...';
    submitBtn.disabled = true;
    
    try {
        // Get auth token
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please sign in as admin to create blog posts.');
            return;
        }
        
        // Send to API
        const response = await fetch('/api/admin/create-blog', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title: formData.title,
                content: formData.content,
                excerpt: formData.excerpt,
                category: 'Blog',
                author: 'Alphabots4All Team',
                tags: formData.tags
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Show success message
            document.getElementById('outputSection').innerHTML = `
                <h3 style="color: green;">✅ Blog Post Created Successfully!</h3>
                <p><strong>Title:</strong> ${formData.title}</p>
                <p><strong>Filename:</strong> ${result.filename}</p>
                <p><strong>Location:</strong> /pages/blogs/${result.filename}</p>
                <p><strong>View Post:</strong> <a href="${result.path}" target="_blank">Open Blog Post</a></p>
                <button onclick="clearForm()" class="btn-admin" style="margin-top: 1rem;">Create Another Post</button>
            `;
            document.getElementById('outputSection').style.display = 'block';
            document.getElementById('outputSection').scrollIntoView({ behavior: 'smooth' });
        } else {
            alert(`Error: ${result.error}`);
        }
    } catch (error) {
        console.error('Blog creation error:', error);
        alert('Failed to create blog post. Please try again.');
    } finally {
        // Restore button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// Copy to clipboard functionality
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    const text = element.textContent;
    
    navigator.clipboard.writeText(text).then(function() {
        // Show temporary feedback
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        btn.style.background = 'green';
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = 'var(--neu-primary)';
        }, 2000);
    }).catch(function(err) {
        console.error('Could not copy text: ', err);
        alert('Copy failed. Please select and copy manually.');
    });
}

// Content insertion tools
let selectedImageStyle = 'center';

function insertImage() {
    document.getElementById('imageModal').style.display = 'flex';
    // Reset modal
    document.getElementById('imageUrl').value = '';
    document.getElementById('imageAlt').value = '';
    selectImageStyle('center');
}

function selectImageStyle(style) {
    selectedImageStyle = style;
    // Update visual selection
    document.querySelectorAll('.image-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.querySelector(`[data-style="${style}"]`).classList.add('selected');
}

function closeImageModal() {
    document.getElementById('imageModal').style.display = 'none';
}

function insertImageContent() {
    const url = document.getElementById('imageUrl').value.trim();
    const alt = document.getElementById('imageAlt').value.trim();
    
    if (!url) {
        alert('Please enter an image URL or emoji!');
        return;
    }
    
    let imageHTML = '';
    const isEmoji = url.length <= 2 && /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(url);
    
    if (isEmoji) {
        // Emoji handling
        switch (selectedImageStyle) {
            case 'center':
                imageHTML = `\n<div class="blog-image-center">\n    <div class="emoji-large">${url}</div>\n</div>\n\n`;
                break;
            case 'left':
                imageHTML = `<span class="emoji-inline emoji-left">${url}</span>`;
                break;
            case 'right':
                imageHTML = `<span class="emoji-inline emoji-right">${url}</span>`;
                break;
            case 'fullwidth':
                imageHTML = `\n<div class="blog-image-full">\n    <div class="emoji-hero">${url}</div>\n</div>\n\n`;
                break;
        }
    } else {
        // Regular image handling
        switch (selectedImageStyle) {
            case 'center':
                imageHTML = `\n<div class="blog-image-center">\n    <img src="${url}" alt="${alt}" class="blog-img">\n    ${alt ? `<p class="image-caption">${alt}</p>` : ''}\n</div>\n\n`;
                break;
            case 'left':
                imageHTML = `<img src="${url}" alt="${alt}" class="blog-img-left">`;
                break;
            case 'right':
                imageHTML = `<img src="${url}" alt="${alt}" class="blog-img-right">`;
                break;
            case 'fullwidth':
                imageHTML = `\n<div class="blog-image-full">\n    <img src="${url}" alt="${alt}" class="blog-img-hero">\n    ${alt ? `<p class="image-caption">${alt}</p>` : ''}\n</div>\n\n`;
                break;
        }
    }
    
    // Insert at cursor position in textarea
    const textarea = document.getElementById('postContent');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    
    textarea.value = text.substring(0, start) + imageHTML + text.substring(end);
    
    // Move cursor after inserted content
    textarea.selectionStart = textarea.selectionEnd = start + imageHTML.length;
    textarea.focus();
    
    closeImageModal();
}

function insertHeading() {
    insertAtCursor('\n<h4>Your Heading Here</h4>\n');
}

function insertList() {
    insertAtCursor('\n<ul>\n    <li>First item</li>\n    <li>Second item</li>\n    <li>Third item</li>\n</ul>\n\n');
}

function insertQuote() {
    insertAtCursor('\n<blockquote>\n    "Your quote here" - Author Name\n</blockquote>\n\n');
}

function insertAtCursor(text) {
    const textarea = document.getElementById('postContent');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;
    
    textarea.value = currentText.substring(0, start) + text + currentText.substring(end);
    textarea.selectionStart = textarea.selectionEnd = start + text.length;
    textarea.focus();
}

// Clear form
function clearForm() {
    document.getElementById('blogForm').reset();
    tags = [];
    renderTags();
    document.getElementById('imagePreview').innerHTML = '📷';
    document.getElementById('outputSection').style.display = 'none';
    
    // Reset date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('postDate').value = today;
}