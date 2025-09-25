// Global variables
let eventsData = [];
let speakersData = [];

// Background images for hero section
const backgroundImages = [
    'assets/homepage/homepage2.jpg',
    'assets/homepage/homepage3.jpg',
    'assets/homepage/homepage5.jpg',
    'assets/homepage/homepage6.jpg',
    'assets/homepage/homepage7.jpg',
    'assets/homepage/homepage9.jpg',
    'assets/homepage/homepage10.jpg'
];

let currentBgIndex = 0;

// Initialize the website
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize navigation first
    initNavigation();

    // Load data and wait for it to complete
    await loadData();

    // Initialize page-specific functionality after data is loaded
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    switch(currentPage) {
        case 'index.html':
        case '':
            initHomepage();
            break;
        case 'events.html':
            initEventsPage();
            break;
        case 'speakers.html':
            initSpeakersPage();
            break;
        case 'speaker-detail.html':
            initSpeakerDetailPage();
            break;
        case 'event-detail.html':
            initEventDetailPage();
            break;
    }
});

// Load JSON data
async function loadData() {
    try {
        const [eventsResponse, speakersResponse] = await Promise.all([
            fetch('data/events.json'),
            fetch('data/speakers.json')
        ]);

        if (!eventsResponse.ok || !speakersResponse.ok) {
            throw new Error('Failed to fetch data');
        }

        eventsData = await eventsResponse.json();
        speakersData = await speakersResponse.json();

        console.log('Data loaded successfully:', { events: eventsData.length, speakers: speakersData.length });
    } catch (error) {
        console.error('Error loading data:', error);
        // Provide fallback empty arrays
        eventsData = [];
        speakersData = [];
    }
}

// Navigation functionality
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

// Homepage functionality
function initHomepage() {
    initEventsCarousel();
}

// Events carousel
function initEventsCarousel() {
    const carouselTrack = document.getElementById('carouselTrack');
    if (!carouselTrack) return;

    console.log('Events data:', eventsData); // Debug log

    if (!eventsData || eventsData.length === 0) {
        console.log('No events data available');
        return;
    }

    // Sort events by date (newest first)
    const sortedEvents = [...eventsData].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Populate carousel
    carouselTrack.innerHTML = sortedEvents.map(event => `
        <div class="carousel-item" onclick="window.location.href='events.html'">
            <img src="${event.flyer}" alt="${event.title}">
        </div>
    `).join('');

    // Initialize carousel controls
    initCarouselControls();
}

// Carousel controls
function initCarouselControls() {
    const track = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (!track || !prevBtn || !nextBtn) return;

    let currentIndex = 0;
    const itemsToShow = window.innerWidth > 768 ? 3 : 1;
    const itemWidth = 300 + 32; // item width + gap

    function updateCarousel() {
        const maxIndex = Math.max(0, eventsData.length - itemsToShow);
        currentIndex = Math.max(0, Math.min(currentIndex, maxIndex));
        track.style.transform = `translateX(-${currentIndex * itemWidth}px)`;

        prevBtn.style.opacity = currentIndex === 0 ? '0.5' : '1';
        nextBtn.style.opacity = currentIndex >= maxIndex ? '0.5' : '1';
    }

    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });

    nextBtn.addEventListener('click', () => {
        const maxIndex = Math.max(0, eventsData.length - itemsToShow);
        if (currentIndex < maxIndex) {
            currentIndex++;
            updateCarousel();
        }
    });

    // Update on window resize
    window.addEventListener('resize', updateCarousel);
    updateCarousel();
}

// Events page functionality
function initEventsPage() {
    populateEventsSimpleList();
}

function populateEventsSimpleList() {
    const eventsSimpleList = document.getElementById('eventsSimpleList');
    if (!eventsSimpleList) return;

    // Sort events by date (newest first)
    const sortedEvents = [...eventsData].sort((a, b) => new Date(b.date) - new Date(a.date));

    eventsSimpleList.innerHTML = sortedEvents.map(event => {
        // Extract topic from title by removing "The People's Saturday School: " prefix
        const topic = event.title.replace("The People's Saturday School: ", "");
        // Format date as readable format
        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const displayTitle = `${formattedDate} | ${topic}`;

        return `
        <div class="event-simple-item" onclick="goToEventDetail('${event.id}')">
            <h2>${displayTitle}</h2>
            <img src="${event.flyer}" alt="${event.title}">
        </div>
        `;
    }).join('');
}

function goToEventDetail(eventId) {
    window.location.href = `event-detail.html?id=${eventId}`;
}

// Individual Event Detail Page
function initEventDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');

    if (eventId) {
        populateEventDetail(eventId);
    }
}

function populateEventDetail(eventId) {
    const event = eventsData.find(e => e.id === eventId);
    if (!event) return;

    document.getElementById('eventFlyerLarge').src = event.flyer;
    document.getElementById('eventDateLarge').textContent = formatDate(event.date);
    document.getElementById('eventTimeLarge').textContent = event.time;
    document.getElementById('eventLocationLarge').textContent = event.location;
    document.getElementById('eventBlurbLarge').textContent = event.blurb;

    // Extract topic from title and populate border text
    const topic = event.title.replace("The People's Saturday School: ", "").toUpperCase();
    const repeatedTopic = (topic + " • ").repeat(10); // Repeat for continuous animation

    console.log('Topic:', topic); // Debug log
    console.log('Repeated topic:', repeatedTopic); // Debug log

    const borderElements = [
        document.getElementById('borderTextTop'),
        document.getElementById('borderTextBottom')
    ];

    borderElements.forEach((element, index) => {
        if (element) {
            element.textContent = repeatedTopic;
            console.log(`Border element ${index} populated`); // Debug log
        } else {
            console.log(`Border element ${index} not found`); // Debug log
        }
    });

    // Populate speakers
    const speakersContainer = document.getElementById('eventSpeakersLarge');
    const eventSpeakers = speakersData.filter(speaker => event.speakers.includes(speaker.id));

    speakersContainer.innerHTML = eventSpeakers.map(speaker => `
        <a href="speaker-detail.html?id=${speaker.id}" class="event-speaker-card">
            <img src="${speaker.headshot}" alt="${speaker.name}">
            <h4>${speaker.name}</h4>
        </a>
    `).join('');

    // Update page title
    document.title = `${event.title} - The People's Saturday School`;
}

function populateEventsGrid() {
    const eventsGrid = document.getElementById('eventsGrid');
    if (!eventsGrid) return;

    // Sort events by date (newest first)
    const sortedEvents = [...eventsData].sort((a, b) => new Date(b.date) - new Date(a.date));

    eventsGrid.innerHTML = sortedEvents.map(event => `
        <div class="event-card" onclick="openEventModal('${event.id}')">
            <img src="${event.flyer}" alt="${event.title}">
            <div class="event-card-content">
                <h3>${event.title}</h3>
                <p class="event-date">${formatDate(event.date)}</p>
            </div>
        </div>
    `).join('');
}

function initEventModal() {
    const modal = document.getElementById('eventModal');
    const closeBtn = document.getElementById('closeModal');

    if (closeBtn) {
        closeBtn.addEventListener('click', closeEventModal);
    }

    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeEventModal();
            }
        });
    }
}

function openEventModal(eventId) {
    const event = eventsData.find(e => e.id === eventId);
    if (!event) return;

    document.getElementById('modalFlyer').src = event.flyer;
    document.getElementById('modalTitle').textContent = event.title;
    document.getElementById('modalDate').textContent = formatDate(event.date);
    document.getElementById('modalTime').textContent = event.time;
    document.getElementById('modalLocation').textContent = event.location;
    document.getElementById('modalBlurb').textContent = event.blurb;

    // Populate speakers
    const speakersContainer = document.getElementById('modalSpeakers');
    const eventSpeakers = speakersData.filter(speaker => event.speakers.includes(speaker.id));

    speakersContainer.innerHTML = eventSpeakers.map(speaker => `
        <a href="speaker-detail.html?id=${speaker.id}" class="speaker-link">
            ${speaker.name}
        </a>
    `).join('');

    document.getElementById('eventModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeEventModal() {
    document.getElementById('eventModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Speakers page functionality
function initSpeakersPage() {
    populateSpeakersGrid();
    initSpeakersSearch();
}

function populateSpeakersGrid(filteredSpeakers = null) {
    const speakersGrid = document.getElementById('speakersGrid');
    if (!speakersGrid) return;

    const speakers = filteredSpeakers || speakersData;

    speakersGrid.innerHTML = speakers.map(speaker => {
        // Get session titles from events (remove "The People's Saturday School: " prefix)
        const speakerEvents = eventsData.filter(event => event.speakers.includes(speaker.id));
        const sessionTitles = speakerEvents.map(event =>
            event.title.replace("The People's Saturday School: ", "")
        ).join(', ');

        return `
            <a href="speaker-detail.html?id=${speaker.id}" class="speaker-card">
                <img src="${speaker.headshot}" alt="${speaker.name}">
                <div class="speaker-card-content">
                    <h3>${speaker.name}</h3>
                    <p class="title">${speaker.title}</p>
                    <p class="session-title"><strong>Session:</strong> ${sessionTitles}</p>
                </div>
            </a>
        `;
    }).join('');
}

function initSpeakersSearch() {
    const searchInput = document.getElementById('speakersSearch');
    if (!searchInput) return;

    searchInput.addEventListener('input', function(e) {
        const query = e.target.value.toLowerCase();
        const filteredSpeakers = speakersData.filter(speaker =>
            speaker.name.toLowerCase().includes(query)
        );
        populateSpeakersGrid(filteredSpeakers);
    });
}

// Speaker detail page functionality
function initSpeakerDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const speakerId = urlParams.get('id');

    if (speakerId) {
        populateSpeakerDetail(speakerId);
    }
}

function populateSpeakerDetail(speakerId) {
    const speaker = speakersData.find(s => s.id === speakerId);
    if (!speaker) return;

    document.getElementById('speakerName').textContent = speaker.name;
    document.getElementById('speakerTitle').textContent = speaker.title;
    document.getElementById('speakerHeadshot').src = speaker.headshot;
    document.getElementById('speakerBio').textContent = speaker.bio;

    // Show selected works if available
    if (speaker.books && speaker.books.length > 0) {
        const selectedWorksSection = document.getElementById('selectedWorks');
        const booksGrid = document.getElementById('booksGrid');

        booksGrid.innerHTML = speaker.books.map(book => `
            <a href="${book.link}" class="book-item" target="_blank" rel="noopener noreferrer">
                <img src="${book.coverImage}" alt="${book.title}">
                <h4>${book.title}</h4>
            </a>
        `).join('');

        selectedWorksSection.style.display = 'block';
    }

    // Update page title
    document.title = `${speaker.name} - The People's Saturday School`;
}

// Utility functions
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Handle window resize for carousel
window.addEventListener('resize', function() {
    if (document.getElementById('carouselTrack')) {
        initCarouselControls();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('eventModal');
        if (modal && modal.style.display === 'block') {
            closeEventModal();
        }
    }
});