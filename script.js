// Replace with your Google Drive folder ID and API key
const FOLDER_ID = "1mdu8y_OMb7C7L82F5QSQ5pIVDUSg2lPO";
const API_KEY = "AIzaSyAuzRGDsAgpbbJXefPaRKTUNZuEHQFHpK4";

const slideshow = document.getElementById("slideshow");
const gallery = document.getElementById("gallery");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const downloadBtn = document.getElementById("download-btn");

// Fetch ALL Google Drive photos (no 100 limit)
async function fetchDrivePhotos() {
  let photos = [];
  let pageToken = "";

  do {
    const url = `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}' in parents and mimeType contains 'image/'&key=${API_KEY}&fields=nextPageToken,files(id,name,mimeType)&pageSize=100${pageToken ? `&pageToken=${pageToken}` : ''}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.files && data.files.length > 0) {
      const pagePhotos = data.files.map(file => `https://drive.google.com/thumbnail?id=${file.id}&sz=w1000`);
      photos = photos.concat(pagePhotos);
    }

    pageToken = data.nextPageToken || "";
  } while (pageToken);

  return photos;
}

// Main
fetchDrivePhotos().then(displayPhotos => {
  let currentIndex = 0; // Track current photo

  // ------------------- Slideshow -------------------
  if (slideshow && displayPhotos.length > 0) {
    displayPhotos.forEach((src, i) => {
      const img = document.createElement("img");
      img.src = src;
      img.referrerPolicy = "no-referrer";
      if (i === 0) img.style.display = "block";
      slideshow.appendChild(img);
    });

    let current = 0;
    setInterval(() => {
      const imgs = slideshow.querySelectorAll("img");
      imgs[current].style.display = "none";
      current = (current + 1) % imgs.length;
      imgs[current].style.display = "block";
    }, 3000);
  }

  // ------------------- Gallery -------------------
  if (gallery) {
    displayPhotos.forEach((src, i) => {
      const img = document.createElement("img");
      img.src = src;
      img.referrerPolicy = "no-referrer";
      img.loading = "lazy";
      gallery.appendChild(img);

      // Open lightbox
      img.addEventListener("click", () => {
        currentIndex = i;
        openLightbox(src);
      });
    });
  }

  // ------------------- Lightbox Logic -------------------
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const downloadBtn = document.getElementById("download-btn");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");

  function openLightbox(src) {
    lightboxImg.src = src;
    downloadBtn.href = src;
    downloadBtn.download = `birthday_photo_${Date.now()}.jpg`;
    lightbox.classList.add("show");
  }

  function showPhoto(index) {
    if (index < 0) index = displayPhotos.length - 1;
    if (index >= displayPhotos.length) index = 0;
    currentIndex = index;
    openLightbox(displayPhotos[currentIndex]);
  }

  // Navigation Buttons
  prevBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    showPhoto(currentIndex - 1);
  });

  nextBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    showPhoto(currentIndex + 1);
  });

  // Close Lightbox when background clicked
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
      lightbox.classList.remove("show");
    }
  });

  // ------------------- Swipe Support for Mobile -------------------
  let startX = 0;

  lightbox.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
  });

  lightbox.addEventListener("touchend", (e) => {
    const endX = e.changedTouches[0].clientX;
    const deltaX = endX - startX;

    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        showPhoto(currentIndex - 1); // Swipe right → prev
      } else {
        showPhoto(currentIndex + 1); // Swipe left → next
      }
    }
  });

});

