// These are the cafe listings that will be shown to the user.
var locations = [
    {
        name: "Big Bad Bagels",
        location: {
            lat: 56.9564139,
            lng: 24.116932,
        },
        //venueID: "5592c908498e0449502114bf"
    },
    {
        name: "Black Magic",
        location: {
            lat: 56.9486843,
            lng: 24.1066858,
        },
       // venueID: "4c790da5a8683704ff200f4d"
    },
    {
        name: "Parunasim",
        location: {
            lat: 56.9505477,
            lng: 24.1022967,
        },
        //venueID: "54ca963b498e775a905e86fe"
    },
    {
        name: "Kuuka Kafe",
        location: {
            lat: 56.9517714,
            lng: 24.1181397,
        },
       //venueID: "4fc609dce4b0a4bd432699f1"
    },
    {
        name: "Rigensis",
        location: { 
            lat: 56.948866,
            lng: 24.1045493,
        },
        //venueID: "4d4c34d2a22c224b1cc5f793"
    },
];
//Location constructor, ref: cat lecture
var Location = function(location, id) {
    this.name = location.name;
    this.lat = location.location.lat;
    this.lng = location.location.lng;
    this.marker = location.marker;
};
// Initiate Google Map
var map;
function initMap() {
    // Constructor creates a new map.
    map = new google.maps.Map(document.getElementById('map'), {
        //Set center of map.
        center: {lat: 56.9493, lng: 24.1049},
        zoom: 16
    });

function googleError() {
    "use strict";
    document.getElementById('error').innerHTML = "<h2>Google Maps is not loading. Please try refreshing the page later.</h2>";
}

    // Create infowindow
    var largeInfowindow = new google.maps.InfoWindow();
    maxWidth: 200;
    //Variable to store the bounds
    var bounds = new google.maps.LatLngBounds();
    // Create markers for each of the locations
    for (var i = 0; i < locations.length; i++) {
        //Get position from the array of locations
        var position = locations[i].location;
        var name = locations[i].name;
        var address = locations[i].address;
        //Create new markers per location
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            name: name,
            address: address,
            animation: google.maps.Animation.DROP,
            id: i,
        });
        // Push the markers to the map
        locations[i].marker = marker;
        //Extend our map to where markers are
        bounds.extend(marker.position);
        //When marker is clicked
        marker.addListener('click', function() {
                this.clicked = true;
                populateInfoWindow(this, largeInfowindow);
                toggleBounce(this, marker);
        });
    }
    // this Animation makes the marker to bounce when clicked, reference: https://developers.google.com/
    function toggleBounce(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
                 marker.setAnimation(google.maps.Animation.null);
                }, 2000);
            }
    //Fit map to bounds
    map.fitBounds(bounds);
    // Initialize Knockout ViewModel
    var vm = new ViewModel();
    ko.applyBindings(vm);
    }

// This function populates the infowindow when the marker is clicked.
function populateInfoWindow(marker, infowindow) {
    // Only open a window if another is not open yet.
    if (infowindow.marker != marker) {
        var client_id = 'P2GE314Z2T4QTFCUWI0URKNGXUXOBOSDXXYOYDYEBJNTCTMW',
            client_secret = 'ENPBHNYOLEQREROI2ZW3122X0IC2UCTE2RKZS0125LTGE4P4',
            query = "coffee",
            location, 
            venue;
    //using the ajax request here to we enable the infowindow content 
        $.ajax({
            url:'https://api.foursquare.com/v2/venues/search?',
            dataType: 'json',
            data:   {
                limit: '5',
                ll: '56.9493,24.1049',
                query: marker.name,
                client_id: client_id,
                client_secret: client_secret,
                v: '20170301',
                m: 'foursquare',
            }
         }).done(function (data) { 
             // If incoming data has a venues object set the first one to the var venue
             var venue = data.response.venues[0];
                console.log(venue); 
             // If the new venue has a property called location set that to the variable location
             location = venue.hasOwnProperty('location') ? venue.location : '';
             // If new location has prop address then set the observable address to that or blank
             if (location.hasOwnProperty('address')) {
                 var address = location.address || '';
             }
            infowindow.marker = marker;
            infowindow.setContent('<div>' + marker.name + '</b>' + '</div>' +
            '<div>' + 'address: ' + address);
            infowindow.open(map, marker);
            //Clear marker porperty when the window is closed.
            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });
        // FourSquare's Error Handling
         }).fail(function () {
             alert('<h5>Foursquare data could not load.Please try again later.</h5>');
         });
    }
}

//View model
var ViewModel = function() {
var self = this;
    //KnockOut array implementation
    self.locationsList = ko.observableArray();
    //Creating a location for each cafe
    locations.forEach(function(locationItem) {
        self.locationsList.push(new Location(locationItem));
    });

    self.inputItem = ko.observable('');
    self.searchFilter = function(value) {
        //removing locations from the list
        self.locationsList.removeAll();
        //adding filterings
        for (var i in locations) {
            if (locations[i].name.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                //pushing to the self.locationsList ko.observableArray.
                self.locationsList.push(locations[i]);
            }
        }

    };
    //marker filtering
    self.markerFilter = function(value) {
        for (var i in locations) {
            if (locations[i].marker.setMap(map) !== null) {
                locations[i].marker.setMap(null);
            }
            if (locations[i].marker.name.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                locations[i].marker.setMap(map);
            }
        }
    };
     //search items with marker filter functions
    self.inputItem.subscribe(self.searchFilter);
    self.inputItem.subscribe(self.markerFilter);

    
    self.displayInfoBounce = function(clickedItem) {

        var index = clickedItem.id;
        var marker = clickedItem.marker;
        google.maps.event.trigger(marker, 'click');
    };
};