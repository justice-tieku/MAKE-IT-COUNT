(function() {
  "use strict";

  const ADMIN_EMAIL = "admin@crosspassion.org";
  const ADMIN_PASSWORD = "crosspassion123";
  const STORAGE_KEYS = {
    sermons: "crosspassion_sermons",
    events: "crosspassion_events"
  };

  const loginSection = document.getElementById("login-section");
  const adminDashboard = document.getElementById("admin-dashboard");
  const loginForm = document.getElementById("loginForm");
  const loginError = document.getElementById("loginError");
  const adminAlert = document.getElementById("adminAlert");

  function showAlert(message, type = "success") {
    adminAlert.innerHTML = `<div class="alert-admin alert-${type}">${message}</div>`;
    setTimeout(() => {
      adminAlert.innerHTML = "";
    }, 3000);
  }

  function isLoggedIn() {
    return sessionStorage.getItem("crosspassion_adminLoggedIn") === "true";
  }

  function setLoggedIn(status) {
    if (status) {
      sessionStorage.setItem("crosspassion_adminLoggedIn", "true");
    } else {
      sessionStorage.removeItem("crosspassion_adminLoggedIn");
    }
  }

  function getSermons() {
    const data = localStorage.getItem(STORAGE_KEYS.sermons);
    return data ? JSON.parse(data) : [];
  }

  function saveSermons(sermons) {
    localStorage.setItem(STORAGE_KEYS.sermons, JSON.stringify(sermons));
  }

  function getEvents() {
    const data = localStorage.getItem(STORAGE_KEYS.events);
    return data ? JSON.parse(data) : [];
  }

  function saveEvents(events) {
    localStorage.setItem(STORAGE_KEYS.events, JSON.stringify(events));
  }

  function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  function formatDate(date) {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  }

  function renderSermonsList() {
    const listContainer = document.getElementById("sermonsList");
    const sermons = getSermons();

    if (sermons.length === 0) {
      listContainer.innerHTML = "<p class=\"text-center\">No sermons uploaded yet.</p>";
      return;
    }

    listContainer.innerHTML = sermons.map((sermon, index) => `
      <div class="content-item">
        <div class="content-item-info">
          <h5>${escapeHtml(sermon.title)}</h5>
          <p>${escapeHtml(sermon.preacher)} | ${sermon.date} | ${sermon.type} | ${escapeHtml(sermon.duration || "")}</p>
        </div>
        <button class="btn-danger-admin" onclick="deleteSermon(${index})">Delete</button>
      </div>
    `).join("");
  }

  function renderEventsList() {
    const listContainer = document.getElementById("eventsList");
    const events = getEvents();

    if (events.length === 0) {
      listContainer.innerHTML = "<p class=\"text-center\">No events uploaded yet.</p>";
      return;
    }

    listContainer.innerHTML = events.map((event, index) => `
      <div class="content-item">
        <div class="content-item-info">
          <h5>${escapeHtml(event.title)}</h5>
          <p>${event.date} | ${escapeHtml(event.category || "Event")}</p>
        </div>
        <button class="btn-danger-admin" onclick="deleteEvent(${index})">Delete</button>
      </div>
    `).join("");
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  window.deleteSermon = function(index) {
    const sermons = getSermons();
    sermons.splice(index, 1);
    saveSermons(sermons);
    renderSermonsList();
    showAlert("Sermon deleted successfully", "success");
  };

  window.deleteEvent = function(index) {
    const events = getEvents();
    events.splice(index, 1);
    saveEvents(events);
    renderEventsList();
    showAlert("Event deleted successfully", "success");
  };

  loginForm.addEventListener("submit", function(e) {
    e.preventDefault();
    const email = document.getElementById("adminEmail").value;
    const password = document.getElementById("adminPassword").value;

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setLoggedIn(true);
      loginSection.classList.add("hidden");
      adminDashboard.classList.remove("hidden");
      loginError.style.display = "none";
      document.getElementById("adminEmail").value = "";
      document.getElementById("adminPassword").value = "";
      renderSermonsList();
      renderEventsList();
    } else {
      loginError.style.display = "block";
    }
  });

  document.getElementById("sermonForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    try {
      const title = document.getElementById("sermonTitle").value;
      const preacher = document.getElementById("sermonSpeaker").value;
      const duration = document.getElementById("sermonDuration").value;
      const type = document.getElementById("sermonType").value;
      const description = document.getElementById("sermonDescription").value;
      const mediaFile = document.getElementById("sermonMedia").files[0];
      const thumbnailFile = document.getElementById("sermonThumbnail").files[0];

      if (!mediaFile) {
        showAlert("Please select a media file.", "danger");
        return;
      }

      const mediaUrl = await readFileAsBase64(mediaFile);
      let thumbnailUrl = "";
      if (thumbnailFile) {
        thumbnailUrl = await readFileAsBase64(thumbnailFile);
      }

      const sermon = {
        title: title,
        preacher: preacher,
        date: formatDate(new Date()),
        duration: duration,
        type: type,
        mediaUrl: mediaUrl,
        thumbnail: thumbnailUrl,
        description: description
      };

      const sermons = getSermons();
      sermons.unshift(sermon);
      saveSermons(sermons);

      document.getElementById("sermonForm").reset();
      renderSermonsList();
      showAlert("Sermon uploaded successfully", "success");
    } catch (error) {
      showAlert("Error uploading sermon. Please try again.", "danger");
      console.error(error);
    }
  });

  document.getElementById("eventForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    try {
      const title = document.getElementById("eventTitle").value;
      const date = document.getElementById("eventDate").value;
      const description = document.getElementById("eventDescription").value;
      const image = document.getElementById("eventImage").value;
      const category = document.getElementById("eventCategory").value;
      const flyerFile = document.getElementById("eventFlyer").files[0];

      let flyerUrl = "";
      if (flyerFile) {
        flyerUrl = await readFileAsBase64(flyerFile);
      }

      const event = {
        title: title,
        date: date,
        description: description,
        image: image,
        flyer: flyerUrl,
        category: category
      };

      const events = getEvents();
      events.unshift(event);
      saveEvents(events);

      document.getElementById("eventForm").reset();
      renderEventsList();
      showAlert("Event uploaded successfully", "success");
    } catch (error) {
      showAlert("Error uploading event. Please try again.", "danger");
      console.error(error);
    }
  });

  if (isLoggedIn()) {
    loginSection.classList.add("hidden");
    adminDashboard.classList.remove("hidden");
    renderSermonsList();
    renderEventsList();
  }

  const mobileNavToggleBtn = document.querySelector(".mobile-nav-toggle");
  if (mobileNavToggleBtn) {
    mobileNavToggleBtn.addEventListener("click", function() {
      document.querySelector("body").classList.toggle("mobile-nav-active");
      mobileNavToggleBtn.classList.toggle("bi-list");
      mobileNavToggleBtn.classList.toggle("bi-x");
    });
  }

  document.querySelectorAll("#navmenu a").forEach(navmenu => {
    navmenu.addEventListener("click", () => {
      if (document.querySelector(".mobile-nav-active")) {
        document.querySelector("body").classList.toggle("mobile-nav-active");
        const toggle = document.querySelector(".mobile-nav-toggle");
        if (toggle) {
          toggle.classList.toggle("bi-list");
          toggle.classList.toggle("bi-x");
        }
      }
    });
  });

})();