function iniciarMap(){
    var coord = {lat: 19.691139, lng: -101.160896};
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15, // Puedes ajustar el nivel de zoom si deseas un enfoque más cercano o más amplio
        center: coord
    });
    var marker = new google.maps.Marker({
        position: coord,
        map: map,
    });
}
