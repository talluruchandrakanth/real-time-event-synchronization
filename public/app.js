const form = document.getElementById("form");
const formTitle = document.getElementById("form-title");

function loadEvents() {
  fetch("/events")
    .then((res) => res.json())
    .then((data) => {
      let html = "";

      data.forEach((e) => {
        const statusHtml =
          e.event_status === "Live"
            ? `<span class="status live"><span class="dot"></span>Live</span>`
            : `<span class="status scheduled"><span class="dot"></span>Scheduled</span>`;

        html += `
        <div class="event">
          <h3>${e.event_name}</h3>
          <p>Type: ${e.event_type}</p>
          <p>Location: ${e.event_location}</p>
          <p>Date: ${new Date(e.event_date).toLocaleString()}</p>
          <p>Ticket: ₹${parseFloat(e.ticket_price).toFixed(2)}</p>
          <p>Status: ${statusHtml}</p>
          <div class="event-actions">
            <button class="btn outline" onclick="deleteEvent(${e.event_id})">Delete</button>
          </div>
        </div>
      `;
      });

      document.getElementById("events").innerHTML = html;
    });
}

let currentStatus = "Scheduled";

function showForm(status) {
  currentStatus = status;
  formTitle.textContent = `Create ${status} Event`;
  form.classList.remove("hidden");
}

function hideForm() {
  form.classList.add("hidden");
}

function addEvent() {
  const name = document.getElementById("name").value.trim();
  const type = document.getElementById("type").value.trim();
  const location = document.getElementById("location").value.trim();
  const date = document.getElementById("date").value;
  const price = document.getElementById("price").value;

  if (!name || !location || !date || !price) {
    alert("Please fill in all required fields: Name, Location, Date, Price.");
    return;
  }

  const event = {
    name,
    type,
    location,
    date,
    price,
    status: currentStatus,
  };

  fetch("/addEvent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  }).then(() => {
    loadEvents();
    hideForm();

    document.getElementById("name").value = "";
    document.getElementById("type").value = "";
    document.getElementById("location").value = "";
    document.getElementById("date").value = "";
    document.getElementById("price").value = "";
  });
}

function deleteEvent(eventId) {
  if (!confirm("Delete this event?")) return;

  fetch(`/deleteEvent/${eventId}`, {
    method: "DELETE",
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to delete event");
      loadEvents();
    })
    .catch(() => {
      alert("Unable to delete event. Please try again.");
    });
}

loadEvents();