class NeuralBackground {
    constructor() {
        this.canvas = document.getElementById('neural-bg');
        this.ctx = this.canvas.getContext('2d');
        this.neurons = [];
        this.connections = [];
        this.mouse = { x: 0, y: 0 };
        this.init();
        this.animate();
        this.setupEventListeners();
    }

    init() {
        this.resize();
        this.createNeurons();
        this.createConnections();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createNeurons() {
        const count = Math.floor((this.canvas.width * this.canvas.height) / 20000);
        for (let i = 0; i < count; i++) {
            this.neurons.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1,
                pulsePhase: Math.random() * Math.PI * 2,
                active: false
            });
        }
    }

    createConnections() {
        for (let i = 0; i < this.neurons.length; i++) {
            for (let j = i + 1; j < this.neurons.length; j++) {
                const dx = this.neurons[i].x - this.neurons[j].x;
                const dy = this.neurons[i].y - this.neurons[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    this.connections.push({
                        from: i,
                        to: j,
                        strength: 1 - distance / 150
                    });
                }
            }
        }
    }

    updateConnections() {
        this.connections = [];
        for (let i = 0; i < this.neurons.length; i++) {
            for (let j = i + 1; j < this.neurons.length; j++) {
                const dx = this.neurons[i].x - this.neurons[j].x;
                const dy = this.neurons[i].y - this.neurons[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    this.connections.push({
                        from: i,
                        to: j,
                        strength: 1 - distance / 150,
                        active: this.neurons[i].active || this.neurons[j].active
                    });
                }
            }
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.neurons.forEach((neuron, index) => {
            neuron.x += neuron.vx;
            neuron.y += neuron.vy;
            neuron.pulsePhase += 0.02;

            if (neuron.x < 0 || neuron.x > this.canvas.width) neuron.vx *= -1;
            if (neuron.y < 0 || neuron.y > this.canvas.height) neuron.vy *= -1;

            const dx = this.mouse.x - neuron.x;
            const dy = this.mouse.y - neuron.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            neuron.active = distance < 100;
        });

        this.updateConnections();

        this.connections.forEach(conn => {
            const from = this.neurons[conn.from];
            const to = this.neurons[conn.to];
            
            this.ctx.beginPath();
            this.ctx.moveTo(from.x, from.y);
            this.ctx.lineTo(to.x, to.y);
            
            if (conn.active) {
                this.ctx.strokeStyle = `rgba(6, 182, 212, ${conn.strength * 1.0})`;
                this.ctx.lineWidth = 3;
                this.ctx.shadowBlur = 5;
                this.ctx.shadowColor = 'rgba(59, 130, 246, 0.8)';
            } else {
                this.ctx.strokeStyle = `rgba(59, 130, 246, ${conn.strength * 0.6})`;
                this.ctx.lineWidth = 1.5;
                this.ctx.shadowBlur = 2;
                this.ctx.shadowColor = 'rgba(59, 130, 246, 0.2)';
            }
            
            this.ctx.stroke();
        });

        this.neurons.forEach(neuron => {
            const pulse = Math.sin(neuron.pulsePhase) * 0.5 + 0.5;
            const radius = neuron.radius + pulse * 3;
            
            this.ctx.beginPath();
            this.ctx.arc(neuron.x, neuron.y, radius, 0, Math.PI * 2);
            
            if (neuron.active) {
                this.ctx.fillStyle = `rgba(59, 130, 246, 1.0)`;
                this.ctx.shadowBlur = 25;
                this.ctx.shadowColor = 'rgba(6, 182, 212, 0.8)';
            } else {
                this.ctx.fillStyle = `rgba(59, 130, 246, ${0.6 + pulse * 0.4})`;
                this.ctx.shadowBlur = 8;
                this.ctx.shadowColor = 'rgba(59, 130, 246, 0.3)';
            }
            
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });

        requestAnimationFrame(() => this.animate());
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resize());
        
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }
}

class MetricVisualizer {
    constructor() {
        this.canvases = document.querySelectorAll('.metric-canvas');
        this.initMetrics();
    }

    initMetrics() {
        this.canvases.forEach(canvas => {
            const ctx = canvas.getContext('2d');
            const value = parseInt(canvas.dataset.value);
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = 60;
            
            this.drawNeuralMetric(ctx, centerX, centerY, radius, value);
        });
    }

    drawNeuralMetric(ctx, x, y, radius, value) {
        const neuronCount = Math.min(Math.floor(value / 100) + 3, 12);
        const angleStep = (Math.PI * 2) / neuronCount;
        
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        for (let i = 0; i < neuronCount; i++) {
            const angle = angleStep * i - Math.PI / 2;
            const nx = x + Math.cos(angle) * radius;
            const ny = y + Math.sin(angle) * radius;
            
            for (let j = i + 1; j < neuronCount; j++) {
                const angle2 = angleStep * j - Math.PI / 2;
                const nx2 = x + Math.cos(angle2) * radius;
                const ny2 = y + Math.sin(angle2) * radius;
                
                ctx.beginPath();
                ctx.moveTo(nx, ny);
                ctx.lineTo(nx2, ny2);
                ctx.strokeStyle = 'rgba(236, 72, 153, 0.1)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
        
        for (let i = 0; i < neuronCount; i++) {
            const angle = angleStep * i - Math.PI / 2;
            const nx = x + Math.cos(angle) * radius;
            const ny = y + Math.sin(angle) * radius;
            
            ctx.beginPath();
            ctx.arc(nx, ny, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#6B46C1';
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(nx, ny, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#EC4899';
            ctx.fill();
        }
        
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#60A5FA';
        ctx.fill();
    }
}

class SmoothScroll {
    constructor() {
        this.initScrollBehavior();
    }

    initScrollBehavior() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
}

class ParallaxEffect {
    constructor() {
        this.elements = document.querySelectorAll('[data-neuron]');
        this.init();
    }

    init() {
        window.addEventListener('scroll', () => this.handleScroll());
    }

    handleScroll() {
        const scrolled = window.pageYOffset;
        
        this.elements.forEach(element => {
            const speed = element.dataset.neuron * 0.5;
            const yPos = -(scrolled * speed / 10);
            element.style.transform = `translateY(${yPos}px)`;
        });
    }
}

class MobileMenu {
    constructor() {
        this.hamburger = document.querySelector('.hamburger');
        this.navLinks = document.querySelector('.nav-links');
        this.isOpen = false;
        this.init();
    }

    init() {
        if (this.hamburger) {
            this.hamburger.addEventListener('click', () => this.toggle());
        }
    }

    toggle() {
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            this.navLinks.style.display = 'flex';
            this.navLinks.style.position = 'absolute';
            this.navLinks.style.top = '100%';
            this.navLinks.style.left = '0';
            this.navLinks.style.right = '0';
            this.navLinks.style.flexDirection = 'column';
            this.navLinks.style.background = 'rgba(15, 23, 42, 0.95)';
            this.navLinks.style.padding = '2rem';
            this.navLinks.style.backdropFilter = 'blur(20px)';
            
            this.hamburger.classList.add('active');
        } else {
            this.navLinks.style.display = '';
            this.navLinks.style.position = '';
            this.navLinks.style.top = '';
            this.navLinks.style.left = '';
            this.navLinks.style.right = '';
            this.navLinks.style.flexDirection = '';
            this.navLinks.style.background = '';
            this.navLinks.style.padding = '';
            
            this.hamburger.classList.remove('active');
        }
    }
}

class IntersectionAnimator {
    constructor() {
        this.elements = document.querySelectorAll('.mission-card, .program-node, .metric-cell, .volunteer-card, .sponsors-carousel-container, .sponsors-subtitle');
        this.init();
    }

    init() {
        const options = {
            threshold: [0, 0.1, 0.5, 1],
            rootMargin: '-10% 0px -10% 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const rect = entry.boundingClientRect;
                const windowHeight = window.innerHeight;
                
                if (entry.isIntersecting) {
                    // Fade in when entering viewport
                    entry.target.style.transition = 'all 0.6s ease-out';
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                } else if (rect.top < 0) {
                    // Fade out when scrolled past (above viewport)
                    entry.target.style.transition = 'all 0.6s ease-out';
                    entry.target.style.opacity = '0';
                    entry.target.style.transform = 'translateY(-20px)';
                } else if (rect.bottom > windowHeight) {
                    // Fade out when below viewport
                    entry.target.style.transition = 'all 0.6s ease-out';
                    entry.target.style.opacity = '0';
                    entry.target.style.transform = 'translateY(20px)';
                }
            });
        }, options);

        this.elements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            observer.observe(el);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new NeuralBackground();
    new MetricVisualizer();
    new SmoothScroll();
    new ParallaxEffect();
    new MobileMenu();
    new IntersectionAnimator();
    
    const programNodes = document.querySelectorAll('.program-node');
    programNodes.forEach((node, index) => {
        node.addEventListener('mouseenter', () => {
            programNodes.forEach((otherNode, otherIndex) => {
                if (otherIndex !== index) {
                    otherNode.style.opacity = '0.5';
                    otherNode.style.filter = 'blur(1px)';
                }
            });
        });
        
        node.addEventListener('mouseleave', () => {
            programNodes.forEach(otherNode => {
                otherNode.style.opacity = '1';
                otherNode.style.filter = 'none';
            });
        });
    });
    
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;
    let ticking = false;
    
    function updateNavbar() {
        const currentScroll = window.pageYOffset;
        const scrollingDown = currentScroll > lastScroll;
        const scrolledPast = currentScroll > 100;
        
        // Add/remove classes for smooth animations
        if (scrollingDown && scrolledPast) {
            navbar.classList.add('navbar-hidden');
            navbar.classList.remove('navbar-visible');
        } else {
            navbar.classList.add('navbar-visible');
            navbar.classList.remove('navbar-hidden');
        }
        
        // Add background blur effect when scrolled
        if (currentScroll > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
        
        lastScroll = currentScroll;
        ticking = false;
    }
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateNavbar);
            ticking = true;
        }
    });
    
    let slideIndex = 0;
    const slides = document.getElementsByClassName('slide');
    const dots = document.getElementsByClassName('dot');
    
    function showSlides() {
        for (let i = 0; i < slides.length; i++) {
            slides[i].classList.remove('active');
        }
        
        for (let i = 0; i < dots.length; i++) {
            dots[i].classList.remove('active');
        }
        
        slideIndex++;
        if (slideIndex > slides.length) {
            slideIndex = 1;
        }
        
        if (slides[slideIndex - 1]) {
            slides[slideIndex - 1].classList.add('active');
        }
        
        if (dots[slideIndex - 1]) {
            dots[slideIndex - 1].classList.add('active');
        }
        
        setTimeout(showSlides, 4000);
    }
    
    window.currentSlide = function(n) {
        slideIndex = n - 1;
        for (let i = 0; i < slides.length; i++) {
            slides[i].classList.remove('active');
        }
        for (let i = 0; i < dots.length; i++) {
            dots[i].classList.remove('active');
        }
        if (slides[slideIndex]) {
            slides[slideIndex].classList.add('active');
        }
        if (dots[slideIndex]) {
            dots[slideIndex].classList.add('active');
        }
    }
    
    if (slides.length > 0) {
        showSlides();
    }
});

// Event Modal Functionality
const eventData = {
    event1: {
        title: "FTC Regional Championship Results",
        date: "December 15, 2024",
        image: "🏆",
        content: `
            <p>Our team competed in the FIRST Tech Challenge Regional Championship, demonstrating our innovative robot design and programming skills. We're proud to announce our advancement to the state level competition.</p>
            
            <h4>Competition Highlights:</h4>
            <ul>
                <li>Advanced to state championship</li>
                <li>Scored highest in autonomous period</li>
                <li>Team collaboration award recipient</li>
                <li>Innovative robot design recognition</li>
            </ul>
            
            <p>The competition featured teams from across the region, each presenting unique solutions to this year's challenge. Our robot's autonomous capabilities and precise mechanical design set us apart from the competition.</p>
            
            <p>We're now preparing for the state championship in January, where we'll compete against the best teams from across California. This achievement represents countless hours of dedication from our team members and mentors.</p>
        `
    },
    event2: {
        title: "Community STEM Workshop Success",
        date: "November 28, 2024",
        image: "👨‍🏫",
        content: `
            <p>We hosted a hands-on robotics workshop for local middle school students, introducing them to programming and mechanical design. Over 50 students participated in building their first robots!</p>
            
            <h4>Workshop Activities:</h4>
            <ul>
                <li>Basic robot construction with LEGO Mindstorms</li>
                <li>Introduction to block-based programming</li>
                <li>Sensor integration and testing</li>
                <li>Mini competition with obstacle courses</li>
            </ul>
            
            <p>The excitement in the room was palpable as students saw their creations come to life. Many participants expressed interest in joining our mentorship program.</p>
            
            <p>Special thanks to our volunteer mentors who made this event possible and to the local schools that helped us reach these aspiring young engineers.</p>
        `
    },
    event3: {
        title: "New Partnership with Local Schools",
        date: "November 10, 2024",
        image: "🤝",
        content: `
            <p>We're excited to announce partnerships with three additional schools in the Bay Area to expand our mentorship program and reach more students interested in STEM fields.</p>
            
            <h4>New Partner Schools:</h4>
            <ul>
                <li>Roosevelt Middle School - Fremont</li>
                <li>Valley View Elementary - Union City</li>
                <li>Castro Valley High School - Castro Valley</li>
            </ul>
            
            <p>These partnerships will allow us to establish robotics clubs, provide mentorship opportunities, and create pathways for students to engage with competitive robotics.</p>
            
            <p>Our goal is to create a sustainable pipeline that introduces students to STEM concepts early and provides continued support through their academic journey.</p>
        `
    },
    event4: {
        title: "Robotics Summer Camp Recap",
        date: "October 22, 2024",
        image: "☀️",
        content: `
            <p>Our summer robotics camp concluded with incredible projects from participants. Students built autonomous robots, learned advanced programming concepts, and developed problem-solving skills.</p>
            
            <h4>Camp Achievements:</h4>
            <ul>
                <li>15 students completed the program</li>
                <li>12 functional robot prototypes built</li>
                <li>Advanced programming concepts mastered</li>
                <li>Team collaboration skills developed</li>
            </ul>
            
            <p>The final showcase featured impressive demonstrations of line-following robots, obstacle-avoiding vehicles, and even a few attempts at autonomous sorting mechanisms.</p>
            
            <p>Many camp participants have expressed interest in joining our year-round programs, showing the lasting impact of these intensive learning experiences.</p>
        `
    },
    event5: {
        title: "Team Wins Innovation Award",
        date: "October 5, 2024",
        image: "🧠",
        content: `
            <p>At the Bay Area STEM Fair, our team was recognized with the Innovation Award for our autonomous sorting robot that uses computer vision and machine learning algorithms.</p>
            
            <h4>Project Features:</h4>
            <ul>
                <li>Computer vision object recognition</li>
                <li>Machine learning classification algorithms</li>
                <li>Autonomous navigation system</li>
                <li>Real-time decision making capabilities</li>
            </ul>
            
            <p>The project demonstrated the practical application of AI in robotics, showcasing how machine learning can be integrated into physical systems to solve real-world problems.</p>
            
            <p>This recognition validates our commitment to pushing the boundaries of what student teams can achieve with modern technology and innovative thinking.</p>
        `
    },
    event6: {
        title: "Volunteer Recognition Event",
        date: "September 18, 2024",
        image: "🎉",
        content: `
            <p>We celebrated our amazing volunteers and mentors who make our programs possible. Their dedication to inspiring young minds in STEM continues to drive our mission forward.</p>
            
            <h4>Recognition Categories:</h4>
            <ul>
                <li>Outstanding Mentor of the Year</li>
                <li>Most Dedicated Volunteer</li>
                <li>Community Impact Award</li>
                <li>Student Inspiration Award</li>
            </ul>
            
            <p>The event featured testimonials from students whose lives have been transformed through our programs, highlighting the direct impact our volunteers have on the community.</p>
            
            <p>We're grateful to have such passionate individuals who donate their time and expertise to help us achieve our mission of expanding STEM education access.</p>
        `
    }
};

function openEventModal(eventId) {
    const modal = document.getElementById('eventModal');
    const modalContent = document.getElementById('modalContent');
    const event = eventData[eventId];
    
    if (event) {
        modalContent.innerHTML = `
            <div class="modal-header">
                <div class="modal-image">${event.image}</div>
                <div>
                    <h2 class="modal-title">${event.title}</h2>
                    <div class="modal-date">${event.date}</div>
                </div>
            </div>
            <div class="modal-body">
                ${event.content}
            </div>
        `;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeEventModal() {
    const modal = document.getElementById('eventModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById('eventModal');
    if (event.target === modal) {
        closeEventModal();
    }
}

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeEventModal();
    }
});