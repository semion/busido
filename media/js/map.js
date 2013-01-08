(function($, google){
    var infoWindow, map, line, markers = {};
    var trip_view = false;
    var line_colors = ['red', 'blue', 'green', 'brown', 'violet'];

    Number.prototype.toRad = function(){
        return this * (Math.PI / 180);
    };

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

        infoWindow = new google.maps.InfoWindow();
        google.maps.event.addListener(infoWindow, 'domready', function(){
            $(".trip_link").bind('click', handle_trip_click);
        });

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



    // http://www.movable-type.co.uk/scripts/latlong.html
    function get_distance(p1, p2){
        var lat1 = p1.lat().toRad(),
            lon1 = p1.lng().toRad(),
            lat2 = p2.lat().toRad(),
            lon2 = p2.lng().toRad(),
            R = 6371000; // m

        return Math.acos(Math.sin(lat1)*Math.sin(lat2) +
                Math.cos(lat1)*Math.cos(lat2) *
                Math.cos(lon2-lon1)) * R;
    }

    function geolocationSuccess(position) {
        var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        map.setCenter(pos);
        google.maps.event.addListener(map, 'idle',
            function(){
                if(trip_view) {
                    return;
                }
                $.getJSON('/api/get_nearest_stops/',{coords: map.getCenter().toUrlValue(10)}, handleStopsList);
            });
    }

    function handleStopsList(data){
        if(data.err === 'ok'){
            var old_marker_keys = Object.keys(markers);
            var new_marker_keys = [];
            // fill new markers obj
            $.each(data.result, function(key, val) {
                new_marker_keys.push(val.id);
                if($.inArray(val.id, old_marker_keys) > -1) {
                    return;
                }
                var marker = new google.maps.Marker({
                    position : new google.maps.LatLng(val.lat, val.lon),
                    map : map,
                    title : val.name,
                    optimized: true
//                    icon: createMarker(13, 14, 7, 'rgba(255, 0, 0, 0.8)')
                });
                marker.stop_id = val.id;
                var l = google.maps.event.addListener(marker, 'click', handleMarkerClick);
                markers[val.id] = marker;
            });
            // remove markers outside boundaries
            $.each(old_marker_keys, function(key, val){
                if($.inArray(val, new_marker_keys) === -1){
                    markers[val].setMap(null);
                    delete markers[val];
                }
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
        infoWindow.setContent("Loading...");
        infoWindow.open(map, marker);

        $.getJSON('/api/get_stop_data/', {
            'stop_id' : marker.stop_id,
            'ts': new Date().getTime() / 1000
        }, function(data) {
            var content = "<h4>" + marker.title + "</h4>";
            if (data.result.length > 0) {
                $.each(data.result, function(pos, val) {
                    content += val.dep +" - <a href='#' class='trip_link' rel='" + val.trip + "'>" + val.number + "</a> " + val.agency + "<br />";
                });
            } else {
                content += "no data<br />";
            }
            infoWindow.setContent(content);
            infoWindow.open(map, marker);
        });
    }

    function handle_trip_click(e){
        e.preventDefault();
        var trip_id = $(this).attr('rel');
        console.log(trip_id);
        infoWindow.close();
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

                // clear previous line
                if(line instanceof google.maps.Polyline){
                    line.setMap(null);
                }

                line = new google.maps.Polyline({
                    path: path,
                    strokeColor: get_line_color(),
                    strokeOpacity: 0.6,
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

        infoWindow.setContent(content);
        map.setCenter(options.position);
    }

    function createMarker(width, height, radius, rgba_color) {

        var canvas, context;

        canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        context = canvas.getContext("2d");

        context.clearRect(0,0,width,height);

        context.fillStyle = rgba_color;

        // border is black
        context.strokeStyle = "rgba(0,0,0,0.7)";

        context.beginPath();
        context.moveTo(radius, 0);
        context.lineTo(width - radius, 0);
        context.quadraticCurveTo(width, 0, width, radius);
        context.lineTo(width, height - radius);
//        context.quadraticCurveTo(width, height, width - radius, height);
        context.lineTo(radius, height);
//        context.quadraticCurveTo(0, height, 0, height - radius);
        context.lineTo(0, radius);
        context.quadraticCurveTo(0, 0, radius, 0);
        context.closePath();

        context.fill();
        context.stroke();

        return canvas.toDataURL();

    }

    google.maps.event.addDomListener(window, 'load', initialize);

})(jQuery, window.google || {});