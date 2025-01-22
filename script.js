emailjs.init('user_zNwpqu03jeU9V3z5MLnIK');
let map;
let markers = [];
let parkingSpots = [];
let currentInfoWindow = null; 
function generateRandomSpots() {
  const spots = [];
  const baseLat = 40.730610; 
  const baseLng = -73.935242; 
  for (let i = 0; i < 100; i++) {
    let randomLat = baseLat + (Math.random() - 0.5) * 0.01; 
    let randomLng = baseLng + (Math.random() - 0.5) * 0.01; 
    spots.push({
      lat: randomLat,
      lng: randomLng,
      name: `Spot ${i + 1}`,
      reserved: false
    });
  }

  return spots;
}

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 40.730610, lng: -73.935242 },
    zoom: 14
  });

  parkingSpots = generateRandomSpots(); 
  parkingSpots.forEach(spot => {
    const marker = new google.maps.Marker({
      position: { lat: spot.lat, lng: spot.lng },
      map: map,
      title: spot.name,
      icon: spot.reserved ? 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
    });

    markers.push(marker); 
    const option = document.createElement("option");
    option.value = spot.name;
    option.textContent = spot.name;
    document.getElementById("spotSelect").appendChild(option);
    google.maps.event.addListener(marker, 'mouseover', function() {
      if (!spot.reserved) {
        const infowindow = new google.maps.InfoWindow({
          content: `Slot: ${spot.name}`,
          position: marker.getPosition()
        });
        if (currentInfoWindow) {
          currentInfoWindow.close();
        }

        currentInfoWindow = infowindow; 
        infowindow.open(map, marker); 
      }
    });
    google.maps.event.addListener(marker, 'mouseout', function() {
      if (currentInfoWindow) {
        currentInfoWindow.close();
        currentInfoWindow = null; 
      }
    });
    marker.addListener('click', function() {
      if (spot.reserved) {
        alert("This spot is already reserved.");
      } else {
        if (confirm(`Do you want to reserve ${spot.name}?`)) {
          spot.reserved = true;
          marker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
          alert(`${spot.name} has been successfully reserved!`);
        }
      }
    });
  });
}
function sendConfirmationEmail(userEmail, userName, selectedSpot, reservationDate, reservationTime, durationHours, durationMinutes) {
  const emailBody = `
    Hi ${userName},\n\n
    Your parking spot reservation is confirmed!\n\n
    Details:\n
    Spot: ${selectedSpot}\n
    Date: ${reservationDate}\n
    Time: ${reservationTime}\n
    Duration: ${durationHours} hours and ${durationMinutes} minutes\n\n
    Thanks for choosing us!
  `;

  emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
    user_email: userEmail,
    user_name: userName,
    parking_spot: selectedSpot,
    reservation_date: reservationDate,
    reservation_time: reservationTime,
    duration: `${durationHours} hours ${durationMinutes} minutes`,
  }).then(() => {
    console.log('Email sent successfully!');
  }).catch(error => {
    console.error('Failed to send email:', error);
  });
}
document.getElementById('reservationForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const userName = document.getElementById("userName").value;
  const phoneNumber = document.getElementById("phoneNumber").value;
  const userEmail = document.getElementById("userEmail").value;
  const vehicleDetails = document.getElementById("vehicleDetails").value;
  const selectedSpot = document.getElementById("spotSelect").value;
  const reservationDate = document.getElementById("reservationDate").value;
  const reservationTime = document.getElementById("reservationTime").value;
  const durationHours = parseInt(document.getElementById("durationHours").value);
  const durationMinutes = parseInt(document.getElementById("durationMinutes").value);

  const spot = parkingSpots.find(spot => spot.name === selectedSpot);

  if (spot && !spot.reserved) {
    spot.reserved = true;
    document.getElementById("reservationForm").style.display = 'none';
    document.getElementById("congratsScreen").style.display = 'block';
    sendConfirmationEmail(userEmail, userName, selectedSpot, reservationDate, reservationTime, durationHours, durationMinutes);

    alert(`${selectedSpot} has been successfully reserved!`);
  } else {
    document.getElementById("errorStatus").style.display = 'block';
    document.getElementById("errorStatus").textContent = "Please select a valid parking spot or check availability!";
  }
});
