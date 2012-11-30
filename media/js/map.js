var info, map, markers = {};
var trip_view = false;
var line_colors = ['red', 'blue', 'green', 'brown', 'violet'];

function get_line_color(){
    var col = line_colors.shift();
    line_colors.push(col);
    return col;
}

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

    $("#hide_stops_link").bind('click', function(e){
        e.preventDefault();
        $(this).text(trip_view ? 'hide stops' : 'show stops');
        trip_view = !trip_view;
        toggle_markers(trip_view ? null : map, false);
    });
}

function geolocationSuccess(position) {
	var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
	map.setCenter(pos);
	google.maps.event.addListener(map, 'idle',
        function(){
            if(trip_view)
                return;
            $.getJSON('/api/get_bounded_stops/',{bounds : map.getBounds().toUrlValue(10)}, handleStopsList);
        });
}

function handleStopsList(data){
	if(data.err === 'ok'){
        var marker_keys = Object.keys(markers);
        // fill new markers obj
		$.each(data.result, function(key, val) {
            if($.inArray(val.id, marker_keys) > -1)
                return;
			var marker = new google.maps.Marker({
				position : new google.maps.LatLng(val.lat, val.lon),
				map : map,
				title : val.name,
                optimized: false
			});
			marker.stop_id = val.id;
			var l = google.maps.event.addListener(marker, 'click', handleMarkerClick);
			markers[val.id] = marker;
		});
	}
}

function toggle_markers(target, clear){
    $.each(markers, function(key, val){
        val.setMap(target);
    });
    if(clear && target === null){
        markers = [];
    }
}

function handleMarkerClick(){
	var marker = this;
	if(info !== undefined)
        info.close();
	$.getJSON('/api/get_stop_data/', {
		'stop_id' : marker.stop_id
	}, function(data) {
		var content = "<h4>" + marker.title + "</h4>";
		if (data.result.length > 0) {
			$.each(data.result, function(pos, val) {
				content += val.dep +" - <a href='#' class='trip_link' rel='" + val.trip + "'>" + val.number + "</a><br />";
			});
		} else {
            content += "no data<br />";
        }

		//var now = new Date();
		//content += "<small>last update " + now.toLocaleTimeString() + "</small>";
		info = new google.maps.InfoWindow({
			map : map,
			position : marker.position,
			content : content
		});
        google.maps.event.addListener(info, 'domready', function(){
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
                path.push(new google.maps.LatLng(val[1], val[0]));
            });
            var line = new google.maps.Polyline({
                path: path,
                strokeColor: get_line_color(),
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
    );

}

function handleNoGeolocation(errorFlag) {
	var content = errorFlag ? 'Error: The Geolocation service failed.' : 'Error: Your browser doesn\'t support geolocation.';
	var options = {
		map : map,
		position : new google.maps.LatLng(60, 105),
		content : content
	};

	var infowindow = new google.maps.InfoWindow(options);
	map.setCenter(options.position);
}

google.maps.event.addDomListener(window, 'load', initialize);
