var info, map, markers = {};

function initialize() {
	var mapOptions = {
		// minZoom : 15,
		zoom : 16,
		// maxZoom : 18,
		streetViewControl : false,
		panControl : false,
		mapTypeControl : false,
		mapTypeId : google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);

	// Try HTML5 geolocation
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(geolocationSuccess, function() {
			handleNoGeolocation(true);
		});
	} else {
		// Browser doesn't support Geolocation
		handleNoGeolocation(false);
	}
}

function geolocationSuccess(position) {
	var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
	map.setCenter(pos);
	google.maps.event.addListener(map, 'idle',
	    function(){
	        $.getJSON('/api/get_bounded_stops/', {
		        bounds : map.getBounds().toUrlValue(10)
	            }, handleStopsList);
            });
}

function handleStopsList(data){
	if(data.err == 'ok'){
	    marker_keys = Object.keys(markers);
	    // fill new markers obj
		$.each(data.result, function(key, val) {
		    if($.inArray(val.id, marker_keys) > -1)
		        return;
		        
			marker = new google.maps.Marker({
				position : new google.maps.LatLng(val.lat, val.lon),
				map : map,
				title : val['name']
			});
			marker['stop_id'] = val.id;
			l = google.maps.event.addListener(marker, 'click', handleMarkerClick);
			markers[val.id] = marker;
		});
	}
}

function handleMarkerClick() {
	marker = this;
	if(info !== undefined)
	    info.close();
	$.getJSON('/api/get_stop_data/', {
		'stop_id' : marker.stop_id
	}, function(data) {
		content = "<h4>" + marker.title + "</h4>";
		if (data.result.length > 0) {
			$.each(data.result, function(pos, val) {
				content += val.dep +" - " + val.number + "<br />";
			});
		} else 
			content += "no data<br />";

		now = new Date();
		content += "<small>last update " + now.toLocaleTimeString() + "</small>";
		info = new google.maps.InfoWindow({
			map : map,
			position : marker.position,
			content : content
		});
	});
}

function handleNoGeolocation(errorFlag) {
	if (errorFlag) {
		var content = 'Error: The Geolocation service failed.';
	} else {
		var content = 'Error: Your browser doesn\'t support geolocation.';
	}

	var options = {
		map : map,
		position : new google.maps.LatLng(60, 105),
		content : content
	};

	var infowindow = new google.maps.InfoWindow(options);
	map.setCenter(options.position);
}

google.maps.event.addDomListener(window, 'load', initialize);
