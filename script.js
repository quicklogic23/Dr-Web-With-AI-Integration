
const specialties = [
  { id: 'dermatologist', name: 'Dermatologist', aliases: ['dermatologist', 'skin', 'dermatology'] },
  { id: 'gynecologist', name: 'Gynecologist', aliases: ['gynecologist', 'gynecology', 'women health'] },
  { id: 'urologist', name: 'Urologist', aliases: ['urologist', 'urology'] },
  { id: 'gastroenterologist', name: 'Gastroenterologist', aliases: ['gastroenterologist', 'stomach'] },
  { id: 'general', name: 'General Practitioner', aliases: ['general', 'gp', 'family doctor', 'primary care'] },
  { id: 'psychiatrist', name: 'Psychiatrist', aliases: ['psychiatrist', 'mental health'] },
  { id: 'pediatrician', name: 'Pediatrician', aliases: ['pediatrician', 'child doctor'] }
];

// DOM elements
const searchInput = document.getElementById('doctor-search');
const voiceSearchBtn = document.getElementById('voice-search-btn');
const searchBtn = document.getElementById('search-btn');
const searchResults = document.getElementById('search-results');

// Voice output function
function speak(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.pitch = 1;
        utterance.rate = 1;
        speechSynthesis.speak(utterance);
    }
}

// Speech recognition setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    searchInput.placeholder = "Listening...";
  };

  recognition.onresult = event => {
    const transcript = event.results[0][0].transcript.toLowerCase();
    searchInput.value = transcript;

    // --- Special voice command: Appointment ---
    if(transcript.includes('book appointment') || transcript.includes('take appointment') || transcript.includes('appointment')) {
        speak('Opening appointment page for you');
        window.location.href = 'book-appointment.html'; // Replace with your appointment page
    } else {
        performSearch(transcript); // Normal doctor search
    }
  };

  recognition.onerror = event => {
    console.error('Speech recognition error:', event.error);
    alert('Speech recognition error: ' + event.error);
  };
} else {
  voiceSearchBtn.style.display = 'none';
  console.log('Speech recognition not supported');
}

// Voice search button
voiceSearchBtn.addEventListener('click', () => {
  if (recognition) recognition.start();
});

// Manual search button
searchBtn.addEventListener('click', () => {
  performSearch(searchInput.value);
});

// Live suggestions
searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase().trim();
  if (!query) return searchResults.classList.add('hidden');

  const matched = specialties.filter(s =>
    s.aliases.some(a => a.includes(query) || query.includes(a))
  );

  searchResults.innerHTML = '';
  if (matched.length) {
    matched.forEach(s => {
      const div = document.createElement('div');
      div.className = 'px-4 py-2 hover:bg-indigo-100 cursor-pointer';
      div.textContent = s.name;
      div.onclick = () => {
        searchInput.value = s.name;
        searchResults.classList.add('hidden');
        performSearch(s.id);
      };
      searchResults.appendChild(div);
    });
    searchResults.classList.remove('hidden');
  } else {
    searchResults.classList.add('hidden');
  }
});

// Close results when clicking outside
document.addEventListener('click', e => {
  if (!e.target.closest('.search-container')) searchResults.classList.add('hidden');
});

// Perform search
function performSearch(query) {
  if (!query.trim()) return;
  const normalized = query.toLowerCase().trim();

  const match = specialties.find(s =>
    s.id === normalized ||
    s.aliases.some(a => a.includes(normalized) || normalized.includes(a))
  );

  if (match) {
    speak(`Showing results for ${match.name}`); // Voice response
    window.location.href = `Find Doctors.html?specialty=${match.id}`;
  } else {
    speak(`Sorry, no results found. Redirecting to all doctors.`);
    window.location.href = 'Find Doctors.html';
  }
}
