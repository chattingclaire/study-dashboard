// Global variables
let backgroundMusic;
let musicEnabled = true;
let progressChart;

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeMusic();
    initializeProgressChart();
    loadSessions();
    loadDiscussions();
    setupEventListeners();
    updateProgressData();
});

// Music Control
function initializeMusic() {
    backgroundMusic = document.getElementById('backgroundMusic');
    backgroundMusic.volume = 0.3;
    
    // Auto-play music after user interaction
    document.addEventListener('click', function() {
        if (musicEnabled && backgroundMusic.paused) {
            backgroundMusic.play().catch(e => console.log('Audio play failed:', e));
        }
    }, { once: true });
}

document.getElementById('musicToggle').addEventListener('click', function() {
    musicEnabled = !musicEnabled;
    if (musicEnabled) {
        backgroundMusic.play();
        this.textContent = '🎵 Music: ON';
    } else {
        backgroundMusic.pause();
        this.textContent = '🎵 Music: OFF';
    }
});

// Video Player
document.querySelectorAll('#videoList a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const videoId = this.getAttribute('data-video');
        document.getElementById('videoPlayer').src = `https://www.youtube.com/embed/${videoId}`;
    });
});

// Progress Chart
function initializeProgressChart() {
    const ctx = document.getElementById('progressChart').getContext('2d');
    progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Study Hours',
                data: [2, 3, 2.5, 4, 3.5, 5, 4.5],
                borderColor: '#5a67d8',
                backgroundColor: 'rgba(90, 103, 216, 0.1)',
                tension: 0.4
            }, {
                label: 'Topics Completed',
                data: [1, 2, 2, 3, 3, 4, 5],
                borderColor: '#48bb78',
                backgroundColor: 'rgba(72, 187, 120, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Update progress data
async function updateProgressData() {
    try {
        const response = await fetch('/api/progress');
        const data = await response.json();
        // Update chart with real data if available
    } catch (error) {
        console.error('Error fetching progress data:', error);
    }
}

// Study Sessions
async function loadSessions() {
    try {
        const response = await fetch('/api/sessions');
        const sessions = await response.json();
        displaySessions(sessions);
    } catch (error) {
        console.error('Error loading sessions:', error);
    }
}

function displaySessions(sessions) {
    const sessionsList = document.getElementById('sessionsList');
    sessionsList.innerHTML = '';
    
    if (sessions.length === 0) {
        sessionsList.innerHTML = '<p class="empty-message">No study sessions scheduled</p>';
        return;
    }
    
    sessions.forEach(session => {
        const sessionItem = document.createElement('div');
        sessionItem.className = 'session-item';
        
        const startTime = new Date(session.start_time);
        const endTime = new Date(session.end_time);
        
        sessionItem.innerHTML = `
            <div class="session-header">
                <span class="session-title">${session.title}</span>
                <button class="btn-danger" onclick="deleteSession(${session.id})">Delete</button>
            </div>
            <div class="session-time">${formatDateTime(startTime)} - ${formatDateTime(endTime)}</div>
            <div class="session-subject">Subject: ${session.subject}</div>
        `;
        
        sessionsList.appendChild(sessionItem);
    });
}

function formatDateTime(date) {
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
}

async function deleteSession(id) {
    if (confirm('Are you sure you want to delete this session?')) {
        try {
            await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
            loadSessions();
        } catch (error) {
            console.error('Error deleting session:', error);
        }
    }
}

// Discussion Forum
async function loadDiscussions() {
    try {
        const response = await fetch('/api/discussions');
        const discussions = await response.json();
        displayDiscussions(discussions);
    } catch (error) {
        console.error('Error loading discussions:', error);
    }
}

function displayDiscussions(discussions) {
    const discussionsList = document.getElementById('discussionsList');
    discussionsList.innerHTML = '';
    
    if (discussions.length === 0) {
        discussionsList.innerHTML = '<p class="empty-message">No discussions yet. Start a conversation!</p>';
        return;
    }
    
    discussions.forEach(discussion => {
        const discussionItem = document.createElement('div');
        discussionItem.className = 'discussion-item';
        discussionItem.onclick = () => viewDiscussion(discussion);
        
        discussionItem.innerHTML = `
            <div class="discussion-title">${discussion.title}</div>
            <div class="discussion-meta">
                By ${discussion.author} • ${new Date(discussion.timestamp).toLocaleDateString()}
                <span class="reply-count"> • ${discussion.replies.length} replies</span>
            </div>
        `;
        
        discussionsList.appendChild(discussionItem);
    });
}

function viewDiscussion(discussion) {
    alert(`Discussion: ${discussion.title}\n\nContent: ${discussion.content}\n\nReplies: ${discussion.replies.length}`);
}

// Modal Functions
function showAddSessionModal() {
    document.getElementById('sessionModal').style.display = 'block';
}

function showNewThreadModal() {
    document.getElementById('threadModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Form Submissions
function setupEventListeners() {
    // Session Form
    document.getElementById('sessionForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const sessionData = {
            title: document.getElementById('sessionTitle').value,
            subject: document.getElementById('sessionSubject').value,
            start_time: document.getElementById('sessionStart').value,
            end_time: document.getElementById('sessionEnd').value,
            description: document.getElementById('sessionDescription').value
        };
        
        try {
            const response = await fetch('/api/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sessionData)
            });
            
            if (response.ok) {
                closeModal('sessionModal');
                loadSessions();
                e.target.reset();
            }
        } catch (error) {
            console.error('Error creating session:', error);
        }
    });
    
    // Thread Form
    document.getElementById('threadForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const threadData = {
            title: document.getElementById('threadTitle').value,
            author: document.getElementById('threadAuthor').value,
            content: document.getElementById('threadContent').value
        };
        
        try {
            const response = await fetch('/api/discussions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(threadData)
            });
            
            if (response.ok) {
                closeModal('threadModal');
                loadDiscussions();
                e.target.reset();
            }
        } catch (error) {
            console.error('Error creating thread:', error);
        }
    });
}

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}