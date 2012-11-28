var info, map, markers = {};
var trip_view = false;

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
            if(trip_view)
                return;
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
				content += val.dep +" - <a href='#' class='trip_link' rel='" + val.trip + "'>" + val.number + "</a><br />";
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
        google.maps.event.addListener(info, 'domready', function(){
            console.log('info window had loaded');
            $(".trip_link").bind('click', handle_trip_click);
        });
	});
}

function handle_trip_click(e){
    e.preventDefault();
    var trip_id = $(this).attr('rel');
    console.log(trip_id);
    info.close();
    trip_view = true;
    $.getJSON('/api/get_trip_stops/', {
        'trip_id': trip_id
    }, function(data){
            $.each(markers, function(key, val){
                val.setMap(null);
                delete markers[key];
            });

            handleStopsList(data);

            var path = [];
            $.each(data.shapes, function(key, val){
                path.push(new google.maps.LatLng(val[0], val[1]));
            });
            var line = new google.maps.Polyline({
                path: path,
                strokeColor: '#ff0000',
                strokeOpacity: 1.0,
                strokeWeight: 3
            });
            line.setMap(map);

            var bounds = new google.maps.LatLngBounds();
            $.each(data.result, function(key, val){
                var latlng = new google.maps.LatLng(val.lat, val.lon);
                bounds.extend(latlng);
            });
            map.fitBounds(bounds);
        }
    )

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
