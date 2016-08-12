
/**
 * @author ${Ebraheem_kashkoush}
 *
 * ${tags}
 */
//the world map bounds N=NORTH(the northest point) S=SOUTH E=East W=WEST 
var limits={N:87,S:-87,E:227,W:-227};
var lat_unit;
var lon_unit;

var lat_div=8;//to how many latitude region to divide the map (min is 3)
var lon_div=12;//to how many longitude region to divide the map (min is 3)
var RegionArr;
var data;
var DataArray;
var map;
var tiles;
var heat;
var size;
var MAX_MAG;
var max_normto=1900;// a define var that contine the the value of the strongest earthquake
function  onRegionArrIndex(point){
	//get point cord and calc where it pushed or should be pushed on the array
	var iS=Math.floor((point.lat-limits.S)/lat_unit);
	//case the last one is mybe his size be greter than one unit
	if(iS>(lat_div-1))
		iS=lat_div-1;
	var jS=Math.floor((point.lon-limits.W)/lon_unit);
	if (jS>(lon_div-1))
		jS=lon_div-1;
	return(iS*lon_div+jS);
}
function BuildRegionArr(){
	//longitude its from east to west the long unit is E-W/NUM OF DIV..	 
	lon_unit=(limits.E-limits.W)/lon_div;
	lat_unit=(limits.N-limits.S)/lat_div;
	RegionArr=new  Array(lat_div*lon_div);
	for(var i=0;i<lat_div;i++){
		for(var j=0;j<lon_div;j++){
			RegionArr[i*lon_div+j]= new  Array();
			if((j<lon_div-1)&&(i<lat_div-1))				
			RegionArr[i*lon_div+j].push({E:(limits.W+(j+1)*lon_unit),W:(limits.W+j*lon_unit),N:limits.S+(i+1)*lat_unit,S:limits.S+i*lat_unit});
			else {
				if(i<lat_div-1)//i<lat j=lon-1
					RegionArr[i*lon_div+j].push({E:limits.E,W:(limits.W+j*lon_unit),N:limits.S+(i+1)*lat_unit,S:limits.S+i*lat_unit});
				else{
				if(j<lon_div-1)
					RegionArr[i*lon_div+j].push({E:(limits.W+(j+1)*lon_unit),W:(limits.W+j*lon_unit),N:limits.N,S:limits.S+i*lat_unit});
				else
					RegionArr[i*lon_div+j].push({E:limits.E,W: limits.W+(j*lon_unit),N:limits.N,S:limits.S+i*lat_unit});
				}
					
			}
		}
	}
	console.log(RegionArr);
}
function AddToRegionArr(){
	
}

function calc_magS1(mag){
	if(mag > MAX_MAG)
		MAX_MAG=mag;
return  Math.pow(10, mag);
	
}
function calc_MagNorm(){
	var corrector=max_normto/Math.pow(10, MAX_MAG);
	for(var i=0;i<DataArray.length;i++)
		DataArray[i][3]=(DataArray[i][3]*corrector);

	
}
//var addrPnt= new array
function update(){
	localStorage.removeItem("jasonData");

	var xhr = new XMLHttpRequest();
	xhr.open('GET', './data/all_month.json', true);
	xhr.send(null);

	xhr.onreadystatechange = function () {//nisted function
	if (xhr.readyState === 4) {
	if (xhr.status === 200 ) {
	data = JSON.parse(xhr.responseText);
	localStorage.setItem("jasonData", JSON.stringify(data));
	}
	}


}
}
function Data(key){

data = localStorage.getItem(key);
if(data != null){
	data = JSON.parse(data);

}else{
var xhr = new XMLHttpRequest();
xhr.open('GET', './data/all_month.json', true);
xhr.send(null);

xhr.onreadystatechange = function () {//nisted function
if (xhr.readyState === 4) {
if (xhr.status === 200 ) {
data = JSON.parse(xhr.responseText);
localStorage.setItem(key, JSON.stringify(data));


} else {
//console.log(xhr.responseText);
//console.log(xhr.readyState);
//console.log(xhr.status);

}
}
//console.log(data);

size=data.length();
}
}
//////////////////////////////////////////////////////////////////////////////////////
/*DataArray STRUCTER
 *ARRAY[ARRAY]=features [quake.properties]
 *
 *quake.properties=[latitude,longitude,depth,magnitude,phases]
 * 
*/
//console.log(data);
//alert(JSON.stringify(data.features));
//alert(data.features[0].properties.status);
DataArray=new Array(data.features.length)
for(var i=0;i<DataArray.length;i++){
	DataArray[i]=new Array(5);
	DataArray[i][0]=data.features[i].geometry.coordinates[1];//.latitude;
	DataArray[i][1]=data.features[i].geometry.coordinates[0];//.longitude;
	DataArray[i][2]=data.features[i].geometry.coordinates[3];//.depth;
	DataArray[i][3]=calc_magS1(data.features[i].properties.mag);

var	temp=onRegionArrIndex({lat:DataArray[i][0],lon:DataArray[i][1]});// its now correct 
//in our functions now 
//latitude=  N<-->S
//longitude= E<-->W
	if(parseInt(temp) > 0)
RegionArr[temp].push({lat:DataArray[i][0],lon:DataArray[i][1],depth:DataArray[i][2],mag:DataArray[i][3]});

	DataArray[i][4]=data.features[i].properties.phases;


	
}
calc_MagNorm()
//DataArray.push( JSON.parse(data));
//console.log(DataArray);

}


function draw()
{
	
	map = L.map('map').setView([0, 0], 2);
	/* map = new L.Map('map', {
		  center: bounds.getCenter(),
		  zoom: 5,
		  layers: [osm],
		  maxBounds: bounds,
		  maxBoundsViscosity: 1.0
		});
	 */tiles = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map);

	 DataArray = DataArray.map(function (p) { 
		 return [p[0], p[1],p[3]]; });

	 heat = L.heatLayer(DataArray).addTo(map);
}
function init(){
	lastclick=0;
	MAX_MAG=0;
	BuildRegionArr();
	Data("jasonData");
	draw();
	document.getElementById("magtd").innerHTML=" : "+	MAX_MAG;
	
	var popup = L.popup();

	function onMapClick(e) {
	    popup
	        .setLatLng(e.latlng)
	        .setContent("You clicked the map at " + e.latlng.toString())
	        .openOn(map);
	}

	map.on('click', onMapClick);
}
function tabEvent(tabid) {
   
    switch(tabid){
    case 'Terrain':
    	// map = L.map('map').setView([-37.87, 175.475], 12);
    	    
    	 L.tileLayer('http://{s}.tile.stamen.com/terrain/{z}/{x}/{y}.png', {
    	    maxZoom: 17
    	  }).addTo(map);
    	 break;
    case 'toner':

    	 L.tileLayer('http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png', {
    		    maxZoom: 17
    		}).addTo(map);
    	 break;
    case 'OpenStreetMap' :
        tiles = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    	}).addTo(map);
        break;
    case 'watercolor':
    	 L.tileLayer('http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.png', {
 		    maxZoom: 17
 		}).addTo(map);
    	break;
    	
    case 'outdoors' :
    	
    	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
			maxZoom: 18,
			id: 'mapbox.outdoors'
		}).addTo(map);
    	break;

    case 'dark' :
    	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
			maxZoom: 18,
			id: 'mapbox.dark'
		}).addTo(map);
    	break;    
    case 'light' :
    	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
			maxZoom: 18,
			id: 'mapbox.light'
		}).addTo(map);
    	break;   
    case 'satellite' :
    	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
			maxZoom: 18,
			id: 'mapbox.satellite'
		}).addTo(map);
    	break; 
    case 'streets' :
    	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
			maxZoom: 18,
			id: 'mapbox.streets'
		}).addTo(map);
    	break; 
    	streets
    }



   
}

window.onLoad =init();




