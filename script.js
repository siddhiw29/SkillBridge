// === Supabase Initialization ===
const SUPABASE_URL = "https://cdpiathucrzyakrqtuiz.supabase.co";
const SUPABASE_ANON_KEY = "PASTE_YOUR_ANON_KEY_HERE"; // keep your anon key here
// create client (use a distinct name to avoid shadowing)
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Optional: listen for auth changes (useful for UI updates)
supabaseClient.auth.onAuthStateChange((event, session) => {
  console.log('Supabase auth event:', event, session);
});

// SkillBridge Website JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('SkillBridge website loaded successfully!');
    
    // Initialize all components
    initNavigation();
    initSignIn();
    initBooking();
    initDashboard();
    initSearch();
});

// Navigation functionality
function initNavigation() {
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileMenu && navMenu) {
        mobileMenu.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (mobileMenu && navMenu) {
                mobileMenu.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    });
}

// Sign In page functionality
function initSignIn() {
    const userTypeButtons = document.querySelectorAll('.user-type-btn');
    const signinBtn = document.querySelector('.signin-btn');
    const passwordToggle = document.querySelector('.password-toggle');
    const passwordInput = document.querySelector('#password');

    // Only initialize if elements exist (sign-in page)
    if (userTypeButtons.length === 0) {
        return;
    }
  async function signUpUser(email, password, userType = 'student') {
  const { data, error } = await supabaseClient.auth.signUp({ email, password });
  if (error) { showNotification(error.message, 'error'); return; }
  // store userType in localStorage (or better: store in profiles table)
  localStorage.setItem('userType', userType);
  showNotification('Account created — check your email to verify.', 'success');
}

async function signOutUser() {
  const { error } = await supabaseClient.auth.signOut();
  if (error) { showNotification(error.message, 'error'); return; }
  localStorage.removeItem('userType');
  showNotification('Signed out', 'info');
  window.location.href = 'signin.html';
}


    // User type toggle
    userTypeButtons.forEach(button => {
        button.addEventListener('click', () => {
            userTypeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const userType = button.dataset.type;
            if (signinBtn) {
                signinBtn.textContent = `Sign In as ${userType.charAt(0).toUpperCase() + userType.slice(1)}`;
            }
        });
    });

    // Password toggle
    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            const icon = passwordToggle.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    }

    // Form submission
    const signinForm = document.querySelector('.signin-form');
    if (signinForm) {
        signinForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.querySelector('#email').value;
            const password = document.querySelector('#password').value;
            const activeUserType = document.querySelector('.user-type-btn.active');
            
            if (!activeUserType) {
                showNotification('Please select user type', 'error');
                return;
            }
            
            const userType = activeUserType.dataset.type;
            
            // Validate form
            if (!email || !password) {
                showNotification('Please fill in all fields', 'error');
                return;
            }
            
            // Simulate login
           // --- Real Supabase sign-in ---
(async () => {
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      showNotification(error.message, 'error');
      return;
    }

    // Success
    showNotification(`Signed in as ${userType}`, 'success');

    // Keep user-type locally (Supabase user metadata or a profiles table is better for production)
    localStorage.setItem('userType', userType);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userName', email.split('@')[0]);

    // Redirect to the right dashboard
    setTimeout(() => {
      if (userType === 'student') {
        window.location.href = 'dashboard.html';
      } else {
        window.location.href = 'tutor-dashboard.html';
      }
    }, 800);

  } catch (err) {
    showNotification('Unexpected error: ' + (err.message || err), 'error');
    console.error(err);
  }
})();

            
            // Store user type in localStorage
            localStorage.setItem('userType', userType);
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userName', email.split('@')[0]);
            
            setTimeout(() => {
                if (userType === 'student') {
                    window.location.href = 'dashboard.html';
                } else {
                    window.location.href = 'tutor-dashboard.html';
                }
            }, 1500);
        });
    }
}

// Booking page functionality
function initBooking() {
    const calendarDays = document.querySelectorAll('.calendar-day');
    const weekDays = document.querySelectorAll('.week-day');
    const timeSlots = document.querySelectorAll('.time-slot.available');
    const monthBtns = document.querySelectorAll('.month-btn');

    // Calendar day selection
    calendarDays.forEach(day => {
        day.addEventListener('click', () => {
            if (!day.classList.contains('other-month')) {
                calendarDays.forEach(d => d.classList.remove('selected'));
                day.classList.add('selected');
                
                // Update week view
                const dayNumber = day.textContent;
                weekDays.forEach(weekDay => {
                    weekDay.classList.remove('selected');
                    if (weekDay.textContent === dayNumber) {
                        weekDay.classList.add('selected');
                    }
                });
                
                // Update available times
                updateAvailableTimes(dayNumber);
            }
        });
    });

    // Week day selection
    weekDays.forEach(day => {
        day.addEventListener('click', () => {
            weekDays.forEach(d => d.classList.remove('selected'));
            day.classList.add('selected');
            
            // Update calendar
            const dayNumber = day.textContent;
            calendarDays.forEach(calDay => {
                calDay.classList.remove('selected');
                if (calDay.textContent === dayNumber) {
                    calDay.classList.add('selected');
                }
            });
            
            updateAvailableTimes(dayNumber);
        });
    });

    // Time slot selection
    timeSlots.forEach(slot => {
        slot.addEventListener('click', () => {
            timeSlots.forEach(s => s.classList.remove('selected'));
            slot.classList.add('selected');
            
            // Show booking confirmation
            showBookingConfirmation(slot.textContent);
        });
    });

    // Month navigation
    monthBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const isNext = btn.querySelector('.fa-chevron-right');
            const monthText = document.querySelector('.month-text');
            
            if (isNext) {
                showNotification('Next month', 'info');
            } else {
                showNotification('Previous month', 'info');
            }
        });
    });
}

// Update available times based on selected date
function updateAvailableTimes(dayNumber) {
    const timesSection = document.querySelector('.times-section .section-title');
    if (timesSection) {
        timesSection.textContent = `Available Times 9/${dayNumber}/2025`;
    }
}

// Show booking confirmation
async function showBookingConfirmation(time) {
  const selectedDateElem = document.querySelector('.calendar-day.selected');
  if (!selectedDateElem) {
    showNotification('Please select a date', 'error');
    return;
  }
  const selectedDate = selectedDateElem.textContent.trim();

  // Basic success notification
  showNotification(`Booking in progress for ${selectedDate} at ${time}...`, 'info');

  // Get current user
  const { data: { user }, error: userErr } = await supabaseClient.auth.getUser();
  if (userErr || !user) {
    showNotification('Please sign in to book session', 'error');
    window.location.href = 'signin.html';
    return;
  }

  const student_id = user.id;
  const selectedTeacher = JSON.parse(localStorage.getItem('selectedTeacher') || '{}');
  const tutor_id = selectedTeacher.id || null;
  const subject = selectedTeacher.specialization || selectedTeacher.speciality || 'General';

  // NOTE: build a proper ISO datetime from the selected date + time later.
  const scheduled_at = new Date().toISOString();

  try {
    const { data, error } = await supabaseClient
      .from('meetings')
      .insert([{
        student_id,
        tutor_id,
        subject,
        scheduled_at
      }]);

    if (error) {
      console.error(error);
      showNotification('Booking failed: ' + error.message, 'error');
      return;
    }

    showNotification('Session booked successfully!', 'success');

    // go to dashboard after booking
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1200);

  } catch (err) {
    console.error(err);
    showNotification('Unexpected error during booking', 'error');
  }
}

// Dashboard functionality
function initDashboard() {
    const searchInput = document.querySelector('.search-input');
    const findTutorsBtn = document.querySelector('.btn-primary');
    const browseSubjectsBtn = document.querySelector('.btn-outline');

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value;
                if (query.trim()) {
                    window.location.href = `find-tutors.html?search=${encodeURIComponent(query)}`;
                }
            }
        });
    }

    if (findTutorsBtn) {
        findTutorsBtn.addEventListener('click', () => {
            window.location.href = 'find-tutors.html';
        });
    }

    if (browseSubjectsBtn) {
        browseSubjectsBtn.addEventListener('click', () => {
            window.location.href = 'subjects.html';
        });
    }

    // Animate dashboard cards
    const overviewCards = document.querySelectorAll('.overview-card');
    overviewCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100);
        }, index * 100);
    });
}

// Search functionality
function initSearch() {
    const searchInputs = document.querySelectorAll('.search-input');
    
    searchInputs.forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = input.value.trim();
                if (query) {
                    if (input.closest('.hero')) {
                        window.location.href = `find-tutors.html?search=${encodeURIComponent(query)}`;
                    } else if (input.closest('.find-tutors-section')) {
                        performTutorSearch(query);
                    }
                }
            }
        });
    });

    // Filter functionality
    const filterDropdown = document.querySelector('.filter-dropdown');
    const clearFilterBtn = document.querySelector('.clear-filter-btn');

    if (filterDropdown) {
        filterDropdown.addEventListener('click', () => {
            showSubjectFilter();
        });
    }

    if (clearFilterBtn) {
        clearFilterBtn.addEventListener('click', () => {
            clearFilters();
        });
    }
}

// Perform tutor search
function performTutorSearch(query) {
    showNotification(`Searching for tutors matching "${query}"...`, 'info');
    
    // Simulate search
    setTimeout(() => {
        showNotification(`Found tutors matching "${query}"`, 'success');
    }, 1000);
}

// Show subject filter
function showSubjectFilter() {
    const subjects = ['All Subjects', 'Mathematics', 'Computer Science', 'Languages', 'Sciences', 'Arts', 'Music', 'Business', 'Literature'];
    
    // Create dropdown menu
    const dropdown = document.createElement('div');
    dropdown.className = 'subject-dropdown';
    dropdown.style.cssText = `
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid var(--border-gray);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-md);
        z-index: 1000;
        max-height: 200px;
        overflow-y: auto;
    `;
    
    subjects.forEach(subject => {
        const item = document.createElement('div');
        item.textContent = subject;
        item.style.cssText = `
            padding: var(--spacing-sm) var(--spacing-md);
            cursor: pointer;
            transition: background-color 0.2s ease;
        `;
        
        item.addEventListener('mouseenter', () => {
            item.style.backgroundColor = 'var(--light-blue)';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.backgroundColor = 'transparent';
        });
        
        item.addEventListener('click', () => {
            document.querySelector('.filter-text').textContent = subject;
            dropdown.remove();
            filterTutorsBySubject(subject);
        });
        
        dropdown.appendChild(item);
    });
    
    const filterContainer = document.querySelector('.filter-dropdown');
    filterContainer.style.position = 'relative';
    filterContainer.appendChild(dropdown);
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!filterContainer.contains(e.target)) {
            dropdown.remove();
        }
    });
}

// Filter tutors by subject
function filterTutorsBySubject(subject) {
    const tutorsGrid = document.getElementById('tutorsGrid');
    const tutorCards = tutorsGrid.querySelectorAll('.tutor-card');
    const searchTitle = document.getElementById('searchTitle');
    
    if (subject === 'All Subjects') {
        tutorCards.forEach(card => {
            card.style.display = 'block';
        });
        searchTitle.textContent = 'Showing all tutors';
    } else {
        tutorCards.forEach(card => {
            if (card.dataset.subject === subject) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
        searchTitle.textContent = `Showing tutors specialized in ${subject}`;
    }
    
    showNotification(`Filtered by ${subject}`, 'info');
}

// View profile function
function viewProfile(teacherId) {
    const teacherData = getTeacherData(teacherId);
    showNotification(`Viewing profile of ${teacherData.name}`, 'info');
    
    // In a real application, this would navigate to a profile page
    setTimeout(() => {
        alert(`Profile of ${teacherData.name}\n\nSpecialization: ${teacherData.specialization}\nExperience: ${teacherData.experience}\nStudents: ${teacherData.students}\nRating: ${teacherData.rating}\n\nLanguages: ${teacherData.languages}\n\nDescription: ${teacherData.description}`);
    }, 500);
}

// Book session function
function bookSession(teacherId) {
    const teacherData = getTeacherData(teacherId);
    localStorage.setItem('selectedTeacher', JSON.stringify(teacherData));
    window.location.href = 'book-session.html';
}

// Get teacher data
function getTeacherData(teacherId) {
    const teachers = {
        'priya-sharma': {
            name: 'Dr. Priya Sharma',
            specialization: 'Mathematics',
            experience: '8+ years',
            students: '127',
            rating: '4.9',
            languages: 'English, Hindi, Bengali',
            description: 'Experienced mathematics tutor specializing in calculus and algebra. I help students build confidence and achieve their academic goals.'
        },
        'rajesh-singh': {
            name: 'Rajesh Singh',
            specialization: 'Mathematics',
            experience: '6+ years',
            students: '95',
            rating: '4.8',
            languages: 'English, Hindi, Punjabi',
            description: 'Passionate about making math fun and accessible. Specializes in geometry, trigonometry, and competitive mathematics.'
        },
        'arjun-kumar': {
            name: 'Arjun Kumar',
            specialization: 'Computer Science',
            experience: '10+ years',
            students: '156',
            rating: '4.9',
            languages: 'English, Hindi, Tamil',
            description: 'Software engineer with 10+ years experience. Expert in Python, Java, and web development. Makes coding concepts easy to understand.'
        },
        'sneha-patel': {
            name: 'Sneha Patel',
            specialization: 'Computer Science',
            experience: '5+ years',
            students: '89',
            rating: '4.7',
            languages: 'English, Hindi, Gujarati',
            description: 'Data scientist and AI enthusiast. Specializes in machine learning, data analysis, and algorithm design. Patient and encouraging teacher.'
        },
        'meera-gupta': {
            name: 'Meera Gupta',
            specialization: 'Languages',
            experience: '12+ years',
            students: '112',
            rating: '4.8',
            languages: 'English, Hindi, Sanskrit',
            description: 'English literature professor with expertise in creative writing, grammar, and communication skills. Helps students excel in language arts.'
        },
        'vikram-reddy': {
            name: 'Vikram Reddy',
            specialization: 'Languages',
            experience: '7+ years',
            students: '78',
            rating: '4.6',
            languages: 'English, Hindi, Telugu, Spanish, French',
            description: 'Multilingual instructor specializing in Spanish, French, and Hindi. Makes language learning interactive and enjoyable.'
        },
        'deepak-kumar': {
            name: 'Dr. Deepak Kumar',
            specialization: 'Sciences',
            experience: '15+ years',
            students: '134',
            rating: '4.9',
            languages: 'English, Hindi, Bengali',
            description: 'Physics professor with expertise in mechanics, thermodynamics, and quantum physics. Makes complex concepts simple and understandable.'
        },
        'anita-sharma': {
            name: 'Anita Sharma',
            specialization: 'Sciences',
            experience: '9+ years',
            students: '98',
            rating: '4.7',
            languages: 'English, Hindi, Punjabi',
            description: 'Chemistry expert specializing in organic chemistry, biochemistry, and laboratory techniques. Patient teacher with practical approach.'
        },
        'ravi-mehta': {
            name: 'Ravi Mehta',
            specialization: 'Arts',
            experience: '8+ years',
            students: '67',
            rating: '4.8',
            languages: 'English, Hindi, Gujarati',
            description: 'Professional artist and art instructor. Specializes in drawing, painting, and digital art. Encourages creativity and self-expression.'
        },
        'sunita-kumar': {
            name: 'Sunita Kumar',
            specialization: 'Music',
            experience: '11+ years',
            students: '89',
            rating: '4.9',
            languages: 'English, Hindi, Tamil',
            description: 'Classical music teacher specializing in Indian classical music, piano, and vocal training. Patient and encouraging instructor.'
        },
        'amit-jain': {
            name: 'Amit Jain',
            specialization: 'Business',
            experience: '6+ years',
            students: '76',
            rating: '4.8',
            languages: 'English, Hindi, Marathi',
            description: 'Business consultant and MBA graduate. Specializes in economics, finance, and marketing strategies. Real-world experience in corporate world.'
        },
        'nisha-mehta': {
            name: 'Nisha Mehta',
            specialization: 'Literature',
            experience: '10+ years',
            students: '92',
            rating: '4.7',
            languages: 'English, Hindi, Gujarati',
            description: 'Literature professor specializing in world literature, poetry analysis, and creative writing. Inspires students to love reading and writing.'
        }
    };
    
    return teachers[teacherId] || teachers['priya-sharma'];
}

// Clear filters
function clearFilters() {
    document.querySelector('.filter-text').textContent = 'All Subjects';
    document.querySelector('.search-input').value = '';
    showNotification('Filters cleared', 'info');
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const iconMap = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        info: 'fas fa-info-circle'
    };
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="${iconMap[type]}"></i>
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    const colors = {
        success: '#34A853',
        error: '#EA4335',
        info: '#4285F4'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        max-width: 400px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, 4000);
}

// Add CSS for notifications
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        margin-left: auto;
    }
    
    .notification-close:hover {
        opacity: 0.8;
    }
`;
document.head.appendChild(notificationStyle);

// Add CSS for selected states
const selectedStyle = document.createElement('style');
selectedStyle.textContent = `
    .time-slot.selected {
        background-color: var(--primary-blue) !important;
        color: white !important;
    }
    
    .week-day.selected {
        background-color: var(--primary-blue) !important;
        color: white !important;
    }
`;
document.head.appendChild(selectedStyle);

// Initialize page-specific functionality
function initPageSpecific() {
    const currentPage = window.location.pathname.split('/').pop().split('.')[0];
    
    switch(currentPage) {
        case 'signin':
            initSignIn();
            break;
        case 'book-session':
            initBooking();
            break;
        case 'dashboard':
            initDashboard();
            break;
        case 'find-tutors':
            initSearch();
            break;
        case 'subjects':
            initSubjects();
            break;
    }
}

// Subjects page functionality
function initSubjects() {
    const subjectCards = document.querySelectorAll('.subject-card');
    
    subjectCards.forEach((card, index) => {
        card.addEventListener('click', () => {
            const subjectTitle = card.querySelector('.subject-title').textContent;
            window.location.href = `find-tutors.html?subject=${encodeURIComponent(subjectTitle)}`;
        });
        
        // Animate cards on load
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100);
        }, index * 100);
    });
}

// Initialize page-specific functionality
initPageSpecific();

// Authentication check
function checkAuth() {
    const userType = localStorage.getItem('userType');
    const currentPage = window.location.pathname.split('/').pop().split('.')[0];
    
    // If user is on dashboard pages but not logged in, redirect to sign in
    if ((currentPage === 'dashboard' || currentPage === 'tutor-dashboard') && !userType) {
        window.location.href = 'signin.html';
        return;
    }
    
    // If user is on sign in page but already logged in, redirect to appropriate dashboard
    if (currentPage === 'signin' && userType) {
        if (userType === 'student') {
            window.location.href = 'dashboard.html';
        } else {
            window.location.href = 'tutor-dashboard.html';
        }
        return;
    }
}

// Check authentication on page load (with delay to allow page to load)
async function checkAuth() {
  // Get session from Supabase
  const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();

  const userType = localStorage.getItem('userType');
  const currentPage = window.location.pathname.split('/').pop().split('.')[0];

  // Not logged in
  if (!session) {
    if (['dashboard', 'tutor-dashboard', 'book-session', 'find-tutors'].includes(currentPage)) {
      // Protected pages - redirect to sign in
      window.location.href = 'signin.html';
    }
    return;
  }

  // Logged in & on sign in page -> redirect to dashboard
  if (currentPage === 'signin') {
    if (userType === 'student') {
      window.location.href = 'dashboard.html';
    } else if (userType === 'tutor') {
      window.location.href = 'tutor-dashboard.html';
    }
  }
}
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(checkAuth, 100);
});

// Add smooth scrolling for anchor links
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

// Add loading states for buttons
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function() {
        if (this.type === 'submit' || this.classList.contains('btn-primary')) {
            this.style.opacity = '0.7';
            this.style.pointerEvents = 'none';
            
            setTimeout(() => {
                this.style.opacity = '1';
                this.style.pointerEvents = 'auto';
            }, 2000);
        }
    });

});





