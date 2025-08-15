// Events data module
const eventsData = [
    {
        id: 1,
        slug: "stem-robotics-workshop",
        title: "STEM Robotics Workshop - Build Your First Robot!",
        description: "Join us for an exciting hands-on robotics workshop where you'll learn the fundamentals of programming and building robots. Perfect for beginners and intermediate learners!",
        fullDescription: "Dive into the world of robotics with our comprehensive hands-on workshop! This beginner-friendly session will introduce you to the basics of robot construction, programming, and operation. You'll work with industry-standard components including Arduino microcontrollers, sensors, and motors to build your very own functional robot.\n\nWhat you'll learn:\n• Basic electronics and circuit design\n• Programming fundamentals with Arduino IDE\n• Sensor integration and data processing\n• Motor control and movement algorithms\n• Problem-solving through engineering design\n\nOur experienced instructors will guide you through each step, ensuring everyone leaves with a working robot and the knowledge to continue their robotics journey. All materials and tools are provided, and you'll take home your completed robot!",
        date: "2025-01-25",
        time: "2:00 PM",
        duration: "3 hours",
        location: "Alphabots4All STEM Lab, 123 Innovation Drive, Fremont, CA",
        price: 25,
        capacity: 20,
        attendees: 0,
        status: "upcoming",
        image: "🤖",
        category: "workshop",
        ageGroup: "10-18",
        prerequisites: "None - Beginners welcome!",
        whatToBring: "Laptop, notebook, enthusiasm!",
        instructor: "Dr. Sarah Johnson",
        tags: ["robotics", "arduino", "programming", "hands-on", "stem"]
    },
    {
        id: 2,
        slug: "ftc-championship-viewing",
        title: "FTC Championship Viewing Party",
        description: "Come watch the FIRST Tech Challenge World Championship with our team! We'll be streaming the live competition, providing snacks, and discussing strategies.",
        fullDescription: "Join our robotics community for an exciting viewing party of the FIRST Tech Challenge World Championship! This is a fantastic opportunity to witness top-tier robotics competition while learning about strategy, teamwork, and innovation.\n\nEvent highlights:\n• Live streaming of championship matches in HD\n• Expert commentary from our experienced mentors\n• Interactive discussions about robot designs and strategies\n• Q&A sessions with former FTC competitors\n• Networking opportunities with local robotics enthusiasts\n• Free snacks and refreshments throughout the event\n\nWhether you're new to robotics or a seasoned veteran, this event offers valuable insights into competitive robotics. You'll see cutting-edge robot designs, learn about the engineering design process, and get inspired for your own robotics projects. This is also a great chance to meet other robotics enthusiasts and potentially join our team!",
        date: "2025-02-15",
        time: "10:00 AM",
        duration: "6 hours",
        location: "Community Center, 456 Tech Boulevard, Fremont, CA",
        price: 0,
        capacity: 50,
        attendees: 0,
        status: "free",
        image: "🏆",
        category: "viewing-party",
        ageGroup: "All ages",
        prerequisites: "None",
        whatToBring: "Your enthusiasm for robotics!",
        instructor: "Team Alphabots Mentors",
        tags: ["ftc", "competition", "viewing-party", "free", "networking"]
    },
    {
        id: 3,
        slug: "intro-to-3d-printing",
        title: "Introduction to 3D Printing for Robotics",
        description: "Learn how to design and print custom robot parts using CAD software and 3D printers. Perfect for taking your robot designs to the next level!",
        fullDescription: "Discover the power of 3D printing in robotics! This comprehensive workshop will teach you how to design, model, and print custom parts for your robots.\n\nCourse content:\n• Introduction to CAD software (Fusion 360)\n• Designing functional robot parts\n• Understanding 3D printer settings and materials\n• Post-processing and assembly techniques\n• Integration with existing robot platforms\n\nYou'll leave with your own 3D printed robot part and the skills to continue creating custom components for your projects. We'll provide access to computers with CAD software and our professional-grade 3D printers.",
        date: "2025-03-10",
        time: "1:00 PM",
        duration: "4 hours",
        location: "Alphabots4All STEM Lab, 123 Innovation Drive, Fremont, CA",
        price: 35,
        capacity: 15,
        attendees: 0,
        status: "upcoming",
        image: "🖨️",
        category: "workshop",
        ageGroup: "12-18",
        prerequisites: "Basic computer skills",
        whatToBring: "USB drive for saving your designs",
        instructor: "Mark Chen",
        tags: ["3d-printing", "cad", "design", "robotics", "workshop"]
    },
    {
        id: 4,
        slug: "python-programming-basics",
        title: "Python Programming for Young Coders",
        description: "Start your coding journey with Python! This beginner-friendly course introduces programming concepts through fun, interactive projects.",
        fullDescription: "Begin your programming adventure with Python, one of the world's most popular and beginner-friendly programming languages!\n\nWhat we'll cover:\n• Variables, data types, and basic operations\n• Control structures (if/else, loops)\n• Functions and modules\n• Simple game development\n• Introduction to robotics programming with Python\n\nThrough hands-on projects and games, you'll learn fundamental programming concepts that apply to robotics and beyond. No prior programming experience required!",
        date: "2025-03-22",
        time: "3:00 PM",
        duration: "2.5 hours",
        location: "Virtual - Online via Zoom",
        price: 15,
        capacity: 30,
        attendees: 0,
        status: "upcoming",
        image: "🐍",
        category: "online-workshop",
        ageGroup: "10-16",
        prerequisites: "None",
        whatToBring: "Computer with internet connection",
        instructor: "Lisa Wang",
        tags: ["python", "programming", "online", "beginners", "coding"]
    },
    {
        id: 5,
        slug: "robot-battle-tournament",
        title: "Spring Robot Battle Tournament",
        description: "Compete with your robot in our exciting battle tournament! Categories for different skill levels and robot types.",
        fullDescription: "Get ready for the ultimate robot showdown! Our Spring Robot Battle Tournament features multiple competition categories to ensure fair and exciting matches for all skill levels.\n\nTournament categories:\n• Beginner Division (First-time competitors)\n• Intermediate Division (1-2 years experience)\n• Advanced Division (2+ years experience)\n• Autonomous Challenge\n• Design Innovation Award\n\nPrizes for top 3 in each division! Registration includes lunch, tournament t-shirt, and participation certificate. Robots must meet safety requirements (guidelines provided upon registration).",
        date: "2025-04-05",
        time: "9:00 AM",
        duration: "All day",
        location: "Fremont Sports Complex, 789 Arena Way, Fremont, CA",
        price: 40,
        capacity: 100,
        attendees: 0,
        status: "upcoming",
        image: "⚔️",
        category: "competition",
        ageGroup: "10-18",
        prerequisites: "Working robot required",
        whatToBring: "Your robot, spare parts, tools, lunch money",
        instructor: "Competition Judges",
        tags: ["competition", "tournament", "battle", "robotics", "prizes"]
    }
];

// Function to get all events
function getAllEvents() {
    return eventsData;
}

// Function to get event by ID
function getEventById(id) {
    return eventsData.find(event => event.id === id);
}

// Function to get event by slug
function getEventBySlug(slug) {
    return eventsData.find(event => event.slug === slug);
}

// Function to get upcoming events
function getUpcomingEvents() {
    const today = new Date();
    return eventsData.filter(event => new Date(event.date) >= today);
}

// Function to get events by category
function getEventsByCategory(category) {
    return eventsData.filter(event => event.category === category);
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        eventsData,
        getAllEvents,
        getEventById,
        getEventBySlug,
        getUpcomingEvents,
        getEventsByCategory
    };
}