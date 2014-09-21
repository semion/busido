// convert Google Maps into an AMD module
define(['async!http://maps.google.com/maps/api/js?key=AIzaSyA9fgCoGTbgzg6tqxKokVWPyPqqHIniqvI&sensor=false'],
function(){
    // return the gmaps namespace for brevity
    return window.google
});
