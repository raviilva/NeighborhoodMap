
// Initializing the map
var map;
// These are the cafe listings that will be shown to the user.
var locations = [
    {
        name: "Big Bad Bagels",
        location: {
            lat: 56.9564139,
            lng: 24.116932,
        },
        id: "5592c908498e0449502114bf"
    },
    {
        name: "Black Magic",
        location: {
            lat: 56.9486843,
            lng: 24.1066858,
        },
        id: "4c790da5a8683704ff200f4d"
    },
    {
        name: "Parunasim",
        location: {
            lat: 56.9505477,
            lng: 24.1022967,
        },
        id: "54ca963b498e775a905e86fe"
    },
    {
        name: "Kuuka Kafe",
        location: {
            lat: 56.9517714,
            lng: 24.1181397,
        },
        id: "4fc609dce4b0a4bd432699f1"
    },
    {
        name: "Rigensis",
        location: { 
            lat: 56.948866,
            lng: 24.1045493,
        },
        id: "4d4c34d2a22c224b1cc5f793"
    },
];
// ---------- Initiate Google Map ----------
function initMap() {
    // Constructor creates a new map.
    map = new google.maps.Map(document.getElementById('map'), {
        //Set center of map.
        center: {lat: 56.9493, lng: 24.1049},
        zoom: 16
    });

    // Create infowindow
    var largeInfowindow = new google.maps.InfoWindow();
    maxWidth: 200;
    //Create bounds that will be displayed on map
    var bounds = new google.maps.LatLngBounds();
    //Loop through the locations
    for (var i = 0; i < locations.length; i++) {
        //Get position from the array of locations
        var position = locations[i].location;
        var name = locations[i].name;
        var content = locations[i].content;
        //Create new markers where at the locations
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            name: name,
            animation: google.maps.Animation.DROP,
            id: i
        });
        // Push the markers to the map
        locations[i].marker = marker;
        //Extend our map to where markers are
        bounds.extend(marker.position);
        //When marker is clicked
        marker.addListener('click', function() {
                populateInfoWindow(this, largeInfowindow);
                toggleBounce(this, marker);
        });
    }
    //Fit map to bounds
    map.fitBounds(bounds);
    
    //Activate Knockout here because we need the google object it provides.
    var vm = new ViewModel();
    ko.applyBindings(vm);
    }

// This function populates the infowindow when the marker is clicked.
function populateInfoWindow(marker, infowindow) {

console.log(marker);
    // Checking that the infowindow is not already open on this marker.
    if (infowindow.marker != marker) {
        infowindow.marker = marker;
        infowindow.setContent('<div>' + marker.name + '</div>');
        infowindow.open(map, marker);

        var client_id = 'P2GE314Z2T4QTFCUWI0URKNGXUXOBOSDXXYOYDYEBJNTCTMW',
            client_secret = 'ENPBHNYOLEQREROI2ZW3122X0IC2UCTE2RKZS0125LTGE4P4',
            query = "coffee",
            location, 
            venue;
    //using the ajax request here to be able to add infowindow content when any location is clicked from the list or the marker.
        $.ajax({
            url:'https://api.foursquare.com/v2/venues/search?',
            dataType: 'json',
            data:   {
                limit: '5',
                ll: '56.9493,24.1049',
                query: marker.name,
                client_id: client_id,
                client_secret: client_secret,
                v: '20170301'
            }
         }).done(function (data) { 
             // If incoming data has a venues object set the first one to the var venue
             venue = data.response.hasOwnProperty("venues") ? data.response.venues[0] : '';

             // If the new venue has a property called location set that to the variable location
             location = venue.hasOwnProperty('location') ? venue.location : '';
             // If new location has prop address then set the observable address to that or blank
             if (location.hasOwnProperty('address')) {
                 var address = location.address || '';
             }

            infowindow.marker = marker;
            infowindow.setContent('<div>' + marker.name + '</div><p>' + address + '</p>');
            infowindow.open(map, marker);
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });

         }).fail(function (e) {
             infowindow.setContent('<h5>Foursquare data could not load.</h5>');
             self.showMessage(true);
         });
    }
}
// Toggle the nav class based style
// code obtained from https://developers.google.com/maps/documentation/javascript/examples/marker-animations
    self.toggleNav = ko.observable(false);
    this.navStatus = ko.pureComputed (function () {
        return self.toggleNav() === false ? 'nav' : 'navClosed';
        }, this);

    self.hideElements = function (toggleNav) {
        self.toggleNav(true);
        // Allow default action
        // Credit Stacy https://discussions.udacity.com/t/click-binding-blocking-marker-clicks/35398/2
        return true;
    };
     self.showElements = function (toggleNav) {
        self.toggleNav(false);
        return true;
    };   

//Location constructor
var Location = function(location, id) {

    this.name = location.name;
    this.lat = location.location.lat;
    this.lng = location.location.lng;
    this.marker = location.marker;
    this.id = id;
};

//View model
var ViewModel = function() {
    var self = this;
    //KnockOut array of list of recommended locations
    self.locationsList = ko.observableArray([]);
    //Creating a location for each cafe
    locations.forEach(function(locationItem) {
        self.locationsList.push(new Location(locationItem));
    });

    // setting up a observable to  be notified by the  input search box.
    self.inputItem = ko.observable('');
    //reference http://opensoul.org/2011/06/23/live-search-with-knockoutjs/
    self.searchFilter = function(value) {
        //remove all the location from the list
        self.locationsList.removeAll();
        //adding filterings
        for (var y in locations) {
            //add the logic finding whether the indexof() returns a matching value in the looplist array.
            if (locations[y].name.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                //pushing the matching locations to the self.locationsList ko.observableArray.
                self.locationsList.push(locations[y]);
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
    self.inputItem.subscribe(self.markerFilterfn);

    //adding the displayInfoBounce function when the list is clicked
    //use the id of the clickedItem to access the corresponding marker and trigger the click event for the corresponding marker
    self.displayInfoBounce = function(clickedItem) {

        var index = clickedItem.id;
        var marker = clickedItem.marker;
        google.maps.event.trigger(marker, 'click');
    };
};