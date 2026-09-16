// Müzik çalar: oynat/duraklat, sıradaki/önceki, ilerleme çubuğu ve kuyruk seçimi
(function () {
  const audio = document.getElementById("player__audio");
  const playBtn = document.getElementById("player__play-btn");
  const prevBtn = document.getElementById("player__prev-btn");
  const nextBtn = document.getElementById("player__next-btn");
  const progressBar = document.getElementById("player__progress-bar");
  const progressFill = document.getElementById("player__progress-fill");
  const progressHandle = document.getElementById("player__progress-handle");
  const currentTimeEl = document.getElementById("player__time-current");
  const totalTimeEl = document.getElementById("player__time-total");
  const titleEl = document.getElementById("player__title-text");
  const coverEl = document.getElementById("player__cover-image");
  const queueList = document.getElementById("player__queue-list");

  if (!audio || typeof TRACKS === "undefined" || !TRACKS.length) return;

  let currentIndex = 0;
  let isSeeking = false;

  function formatTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  function renderQueue() {
    queueList.innerHTML = TRACKS.map((track, index) => `
      <button data-index="${index}" class="player__queue-btn flex w-full items-center w-full">
        <span class="player__queue-index w-1/12">${index + 1}</span>
        <div class="player__queue-info w-8/12">
          <span class="player__queue-title text-xs sm:text-sm md:text-base uppercase tracking-[0.25em] text-stone-300/80 font-['DM_Sans']">${track.title}</span>
        </div>
        ${track.explicit ? `
        <div class="player__queue-extra-container border w-1/13">
          <span class="player__queue-extra">E</span>
        </div>` : ""}
        <span class="player__queue-duration w-3/12">${track.duration || "0:00"}</span>
      </button>
    `).join("");

    queueList.querySelectorAll(".player__queue-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        playTrackAt(Number(btn.dataset.index));
      });
    });
  }

  function setActiveQueueItem(index) {
    queueList.querySelectorAll(".player__queue-btn").forEach((btn) => {
      btn.id = Number(btn.dataset.index) === index ? "player__queue-active" : "";
    });
  }


  function loadTrack(index, autoplay) {
    const track = TRACKS[index];
    if (!track) return;

    currentIndex = index;
    audio.src = track.src;
    titleEl.textContent = track.subtitle || track.title;
    coverEl.src = track.cover;
    coverEl.alt = track.title;
    totalTimeEl.textContent = track.duration || "0:00";
    progressFill.style.width = "0%";
    progressHandle.style.left = "0%";
    setActiveQueueItem(index);

    if (autoplay) {
      audio.play().catch(() => {});
    }
  }

  function updatePlayIcon(isPlaying) {
    const icon = playBtn.querySelector("i");
    icon.classList.toggle("fa-play", !isPlaying);
    icon.classList.toggle("fa-pause", isPlaying);
    playBtn.setAttribute("aria-label", isPlaying ? "Pause" : "Play");
  }

  function togglePlay() {
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }

  function playTrackAt(index) {
    const isSameTrack = index === currentIndex;
    loadTrack(index, true);
    if (isSameTrack) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  }

  function goToNext() {
    const nextIndex = (currentIndex + 1) % TRACKS.length;
    playTrackAt(nextIndex);
  }

  function goToPrev() {
    const prevIndex = (currentIndex - 1 + TRACKS.length) % TRACKS.length;
    playTrackAt(prevIndex);
  }

  function seekFromClientX(clientX) {
    const rect = progressBar.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    if (audio.duration) {
      audio.currentTime = ratio * audio.duration;
    }
    progressFill.style.width = `${ratio * 100}%`;
    progressHandle.style.left = `${ratio * 100}%`;
  }

  playBtn.addEventListener("click", togglePlay);
  nextBtn.addEventListener("click", goToNext);
  prevBtn.addEventListener("click", goToPrev);

  audio.addEventListener("play", () => updatePlayIcon(true));
  audio.addEventListener("pause", () => updatePlayIcon(false));

  audio.addEventListener("loadedmetadata", () => {
    if (audio.duration) {
      totalTimeEl.textContent = formatTime(audio.duration);
    }
  });

  audio.addEventListener("timeupdate", () => {
    if (isSeeking || !audio.duration) return;
    const ratio = audio.currentTime / audio.duration;
    progressFill.style.width = `${ratio * 100}%`;
    progressHandle.style.left = `${ratio * 100}%`;
    currentTimeEl.textContent = formatTime(audio.currentTime);
  });

  audio.addEventListener("ended", goToNext);

  progressBar.addEventListener("pointerdown", (e) => {
    isSeeking = true;
    seekFromClientX(e.clientX);
    progressBar.setPointerCapture(e.pointerId);
  });

  progressBar.addEventListener("pointermove", (e) => {
    if (!isSeeking) return;
    seekFromClientX(e.clientX);
  });

  progressBar.addEventListener("pointerup", (e) => {
    isSeeking = false;
    progressBar.releasePointerCapture(e.pointerId);
  });

  progressBar.addEventListener("pointercancel", () => {
    isSeeking = false;
  });

  renderQueue();
  loadTrack(currentIndex, false);
})();
