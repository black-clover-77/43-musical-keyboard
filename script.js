const keys = document.querySelectorAll('.key');
const oscTypeSelect = document.getElementById('osc-type');
const audioToggle = document.getElementById('audio-toggle');

let audioCtx;
const activeOscillators = {};

const noteFrequencies = {
    'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13,
    'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00,
    'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
    'C5': 523.25
};

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playNote(note) {
    initAudio();
    if (activeOscillators[note]) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = oscTypeSelect.value;
    osc.frequency.setValueAtTime(noteFrequencies[note], audioCtx.currentTime);
    
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.1); // Attack
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    activeOscillators[note] = { osc, gain };
}

function stopNote(note) {
    if (activeOscillators[note]) {
        const { osc, gain } = activeOscillators[note];
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5); // Release
        setTimeout(() => {
            osc.stop();
            osc.disconnect();
        }, 500);
        delete activeOscillators[note];
    }
}

keys.forEach(key => {
    const note = key.dataset.note;
    
    const startEvent = (e) => {
        e.preventDefault();
        key.classList.add('active');
        playNote(note);
    };
    
    const endEvent = (e) => {
        e.preventDefault();
        key.classList.remove('active');
        stopNote(note);
    };

    key.addEventListener('mousedown', startEvent);
    key.addEventListener('mouseup', endEvent);
    key.addEventListener('mouseleave', endEvent);
    
    key.addEventListener('touchstart', startEvent);
    key.addEventListener('touchend', endEvent);
});

// Keyboard mapping
const keyMap = {
    'a': 'C4', 'w': 'C#4', 's': 'D4', 'e': 'D#4', 'd': 'E4', 'f': 'F4',
    't': 'F#4', 'g': 'G4', 'y': 'G#4', 'h': 'A4', 'u': 'A#4', 'j': 'B4', 'k': 'C5'
};

window.addEventListener('keydown', (e) => {
    const note = keyMap[e.key.toLowerCase()];
    if (note) {
        const keyEl = document.querySelector(`[data-note="${note}"]`);
        keyEl.classList.add('active');
        playNote(note);
    }
});

window.addEventListener('keyup', (e) => {
    const note = keyMap[e.key.toLowerCase()];
    if (note) {
        const keyEl = document.querySelector(`[data-note="${note}"]`);
        keyEl.classList.remove('active');
        stopNote(note);
    }
});