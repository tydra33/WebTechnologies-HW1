"use strict";

let suggMarkers = [];
let custMarkers = [];
let map;

//41.11337908290563, 20.79266674351253
function initMap() {
  const ohridCenter = { lat: 41.11337908290563, lng: 20.79266674351253 };
  map = new google.maps.Map(document.getElementById('googleMap'), {
    center: ohridCenter,
    zoom: 16,
    mapId: 'c0bbf748d25890f4'
  });

  google.maps.event.addListener(map, "click", (event) => {
    if ($("#tagLabel").val() == "" || !isTitleAvailable($("#tagLabel").val())) alert("Please insert a valid string");
    else addCustomMarker(event.latLng, map);
  });

  addSuggested();
  addSaved();
}

function isTitleAvailable(title) {
  for (var i = 0; i < custMarkers.length; i++) {
    if (custMarkers[i].getTitle() == title) return false;
  }
  return true;
}

function addSuggested() {
  addMarker(new google.maps.LatLng(41.11477456303055, 20.79367563143785), map, "Ancient theatre", "Ancient theatre");
  addMarker(new google.maps.LatLng(41.111109280850506, 20.788752122932813), map, "Kaneo", "Kaneo");
  addMarker(new google.maps.LatLng(41.115198645265544, 20.790834368941127), map, "Samoil`s Fortress", "Samoil`s Fortress");
  addMarker(new google.maps.LatLng(41.11209697929036, 20.794233068941033), map, "St. Sophia", "St. Sophia");
  addMarker(new google.maps.LatLng(41.112359073785235, 20.796121166801424), map, "Robev Family House", "Robev Family House");
}

function addSaved() {
  if (localStorage.getItem("markers") != null) {
    var containers = JSON.parse(localStorage.getItem("markers"));

    for (var i = 0; i < containers.length; i++) {
      var container = containers[i]
      addCustomMarker(container.position, map, container.label);
    }
  }
}

// add point of interest marker
function addMarker(location, map, labelStr, title) {
  const newMarker = new google.maps.Marker({
    position: location,
    label: labelStr,
    map: map,
    icon: {
      url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
      labelOrigin: new google.maps.Point(10, -10)
    },
    title: title
  });

  const contentString = '<a href="landmarks/' + labelStr + '.html">Read More</a>';
  const infowindow = new google.maps.InfoWindow({
    content: contentString,
  });

  newMarker.addListener("click", () => {
    infowindow.open(map, newMarker);
  });

  suggMarkers.push(newMarker);
}

// add custom marker
function addCustomMarker(location, map, newLabel = $("#tagLabel").val()) {
  const newMarker = new google.maps.Marker({
    position: location,
    label: newLabel,
    title: newLabel,
    map: map,
    draggable: true,
    icon: {
      url: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
      labelOrigin: new google.maps.Point(10, -10)
    },
  });

  // add event listener for delete
  newMarker.addListener("dblclick", () => {
    if (confirm("Are you sure you want to delete marker?")) {
      console.log(newMarker.getTitle());
      for (var i = 0; i < custMarkers.length; i++) {
        if (custMarkers[i].getTitle() == newMarker.getTitle()) {
          custMarkers.splice(i, 1);
        }
      }
      console.log(custMarkers);

      var containers_Str = localStorage.getItem("markers");
      var containers = JSON.parse(containers_Str);
      for (var i = 0; i < containers.length; i++) {
        if (containers[i].label == newMarker.label) containers.splice(i, 1);
      }
      containers_Str = JSON.stringify(containers);
      localStorage.setItem("markers", containers_Str);

      newMarker.setMap(null);
    }
  });

  // add event listener for drag to keep local storage updated
  google.maps.event.addListener(newMarker, 'dragend', () => {
    const mapContainer = {
      position: newMarker.position,
      label: newMarker.label,
    }

    var containers_Str = localStorage.getItem("markers");
    var containers = JSON.parse(containers_Str);
    for (var i = 0; i < containers.length; i++) {
      if (containers[i].label == newMarker.label) containers.splice(i, 1);
    }

    containers.push(mapContainer);
    containers_Str = JSON.stringify(containers);
    localStorage.setItem("markers", containers_Str);
  });

  // if the marker is new, make sure to save it to local storage
  if (newLabel == $("#tagLabel").val()) {
    const mapContainer = {
      position: location,
      label: newLabel,
    }

    var containers_Str = localStorage.getItem("markers");
    var containers;
    if (containers_Str == null) containers = [];
    else containers = JSON.parse(containers_Str);

    containers.push(mapContainer);
    containers_Str = JSON.stringify(containers);
    localStorage.setItem("markers", containers_Str);
  }

  custMarkers.push(newMarker);
  console.log(custMarkers);
}

// hide suggested markers
$("#hideMarkers").click(() => {
  if ($("#hideMarkers").is(":checked")) {
    for (var i = 0; i < suggMarkers.length; i++) {
      suggMarkers[i].setMap(null)
    }
  }
  else {
    for (var i = 0; i < suggMarkers.length; i++) {
      suggMarkers[i].setMap(map)
    }
  }
});

$("#search").click(() => {
  // search suggested markers
  if (!$("#hideMarkers").is(":checked")) {
    for (var i = 0; i < suggMarkers.length; i++) {
      if (suggMarkers[i].title == $("#searchMarker").val()) {
        map.setZoom(19);
        map.setCenter(suggMarkers[i].position);
        return;
      }
    }
  }

  // search custom markers
  for (var i = 0; i < custMarkers.length; i++) {
    if (custMarkers[i].title == $("#searchMarker").val()) {
      map.setZoom(19);
      map.setCenter(custMarkers[i].position);
      return;
    }
  }

  alert($("#searchMarker").val() + " not found or invalid");
});

