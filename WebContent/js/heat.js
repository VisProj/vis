
/**
 * @author ${Ebraheem_kashkoush} 
 *
 *(do not distribute) 
 * ${tags}
 */
//the world map bounds N=NORTH(the northest point) S=SOUTH E=East W=WEST 
var limits={N:87,S:-87,E:227,W:-227};
var lat_unit;
var lon_unit;
var bounds ;
var container;
var currentmap;
var circVis=0;//if Circles visualization used
var lat_div=8;//to how many latitude region to divide the map (min is 3)
var lon_div=12;//to how many longitude region to divide the map (min is 3)
var selectedArr=[];// array hold selected Rectangles
var PrevSelectedArr ;//array hold previous selectedArr for little Dynamic Programming its not really Dynamic Programming
var newSelected=[];//array contine the new selected rec's wich it is selectedArr-PrevSelectedArr if updateSelect=1
var updateSelect=0;// bool var if we only need to update the selected his value will be 1 else 0
var RegionArr;
var data;
var DataArray;
var DataArray2;
var map;
var ONchangeOFF=1;
var tiles;
var heat;
var areaSelect;
var size;
var MAX_MAG;
var AllMaxMag;
var max_normto=1900;// a define var that contine the the value of the strongest earthquake
var on_select=0;




/*#####################################################################################################################
 * ################################### @author ${Ebraheem_kashkoush} 								###################
 * ###################################selector on Change+ update DataArray to selected region	    ###################
 * ################################### tags: #select												###################
 * ####################################################################################################################
 * 
 */

function selectorChange(Limits){

	var iTO=Math.ceil((Limits.N-limits.S)/lat_unit);
	var jTO=Math.ceil((Limits.E-limits.W)/lon_unit);
	var iFROM=Math.floor((Limits.S-limits.S)/lat_unit);
	var jFROM=Math.floor((Limits.W-limits.W)/lon_unit);
	if(iFROM<0)//Limits.S<limits.S
		iFROM=0;
	if(jFROM<0)
		jFROM=0;
	if(iTO>(lat_div))
		iTO=lat_div;
	if(jTO>(lon_div))
		jTO=lon_div;
	
		
	//map.removeLayer(heat);
	//Rounding up containing Rectangle (to biger  Rectangle containing full Rectangles)
	NewCord={N:-1,S:-1,W:-1,E:-1}
	NewCord.S=limits.S+(iFROM*lat_unit);
	NewCord.W=limits.W+(jFROM*lon_unit);
	NewCord.N=limits.S+(iTO*lat_unit);
	NewCord.E=limits.W+(jTO*lon_unit);
	if(NewCord.N>limits.N)
		NewCord.N=limits.N;
	if(NewCord.E>limits.E)
		NewCord.E=limits.E;
	
	//calc num of Rectangle of every  direction lat and lon
	var latRecs=Math.ceil((NewCord.N-NewCord.S)/lat_unit);
	var lonRecs=Math.ceil((NewCord.E-NewCord.W)/lon_unit);
	//initialization or update of selectedArr array
	PrevSelectedArr=[];
	PrevSelectedArr.length=0;
	if(selectedArr.length>0)
	PrevSelectedArr=selectedArr;
	
	selectedArr=[];
	selectedArr.length=0;
	for(var i=iFROM;i< iTO;i++)//need a check tomorrow
		for(var j=jFROM;j<jTO;j++)
			selectedArr.push(i*lon_div+j);
	
	//check if to update or calc the all
	/*not completed so it have many errors i see that for now we not really need it becouse it calc the heat very fast
	console.log("PrevSelectedArr =" +PrevSelectedArr)
	console.log("selectedArr =" +selectedArr)
	var ko=0;
	updateSelect=1;
	var coco=0;
	for(var ki=0;ki<PrevSelectedArr.length;ki++){
		while((PrevSelectedArr[ki]!=selectedArr[ko])&&(PrevSelectedArr[ki]>selectedArr[ko])&&(ko<selectedArr.length)){
 			newSelected.push(selectedArr[ko]);
			ko++;
		}
		if(ko>(selectedArr.length-1)){
			updateSelect=0;
		}
		coco=1;
	}
	if(coco){
	while(ko<selectedArr.length){
		newSelected.push(selectedArr[ko]);
		ko++;
	}
	coco=0;
	}*/
	//re initialization of DataArray
	//console.log("newSelected =" +newSelected)

	
	

	if(!updateSelect){
	DataArray=[];
	DataArray.length=0;
	MAX_MAG=0;

	var counter=0;
	var tempLat,tempLon;
	for(var i=0;i<selectedArr.length;i++){

		if(RegionArr[selectedArr[i]].length>1){
			for(var j=1;j<RegionArr[selectedArr[i]].length;j++){
				
				tempLat=RegionArr[selectedArr[i]][j].lat;//.latitude;
				tempLon=RegionArr[selectedArr[i]][j].lon;//.longitude;
				//hint for improve we need only this check on the border so to get little improve you cans split it to to for's
				if((tempLat>=Limits.S)&&(tempLat<=Limits.N)&&(tempLon>=Limits.W)&&(tempLon<=Limits.E)){
					DataArray[counter]=new Array(4);
				DataArray[counter][0]=tempLat;
				DataArray[counter][1]=tempLon;
			DataArray[counter][2]=RegionArr[selectedArr[i]][j].depth;//.depth;
				DataArray[counter][3]=calc_magS1(RegionArr[selectedArr[i]][j].mag);

				counter=counter+1;
				}
			}
				
		}
		


	}
	
	
		
	}
	else{
		console.log("not finished yet")
	}
	
	map.removeLayer(heat);

	//console.log(DataArray);


	



}

function turnselectorOff(){
	document.getElementById("OFF").style.display='none';
	document.getElementById("ON").style.display='block';
	ONchangeOFF=0;
	map.removeLayer(heat);
	map.removeLayer(areaSelect);

 	areaSelect.remove();

	draw_allMap();
	on_select=0;
		document.getElementById("magtd").innerHTML=" : "+	MAX_MAG;

}

function selectWh(w,h){
	
	 areaSelect = L.areaSelect({width:w, height:h});
	
	   areaSelect.on("change", function() {
		   if(ONchangeOFF){
             bounds = this.getBounds();
           selectorChange({S:bounds.getSouthWest().lat,W:bounds.getSouthWest().lng,N:bounds.getNorthEast().lat,E:bounds.getNorthEast().lng})
       
            
		   }
       });
	  
	areaSelect.addTo(map);
	on_select=2;
	
}

function turnselectorON(){
	document.getElementById("OFF").style.display='block';
	document.getElementById("ON").style.display='none';
	ONchangeOFF=1;
	if(on_select<1){
	 areaSelect = L.areaSelect({width:200, height:300});
	
	   areaSelect.on("change", function() {
		   if(ONchangeOFF){
             bounds = this.getBounds();
           selectorChange({S:bounds.getSouthWest().lat,W:bounds.getSouthWest().lng,N:bounds.getNorthEast().lat,E:bounds.getNorthEast().lng})
       
           calc_MagNorm();

   		draw();
   		
   		console.log("MAX_MAG ="+MAX_MAG);
   		document.getElementById("magtd").innerHTML=" : "+	MAX_MAG;
		   }
       });
	  
	areaSelect.addTo(map);
	on_select=2;
	}
}

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@


/*#############################################################################################################################
 * ################################### @author ${Ebraheem_kashkoush} 										###################
 * ###################################initialize RegionArr + check where the point on the region array	    ###################
 * ################################### tags: #RegionArr														###################
 * ############################################################################################################################
 * 
 */




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
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

/*#############################################################################################################################
 * ################################### @author ${Ebraheem_kashkoush} 										###################
 * ###################################calc magnitude to correct one that show the power of earthquake 	    ###################
 * ################################### tags: #mag												            ###################
 * ############################################################################################################################
 * 
 */
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


//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

/*#############################################################################################################################
 * ################################### @author ${Ebraheem_kashkoush} 										###################
 * ###################################DATA init region array+ data array+ localstorge +update		 	    ###################
 * ################################### tags: #DATA #region										            ###################
 * ############################################################################################################################
 * 
 */
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
DataArray=new Array(data.features.length);
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
RegionArr[temp].push({lat:DataArray[i][0],lon:DataArray[i][1],depth:DataArray[i][2],mag:data.features[i].properties.mag});

	DataArray[i][4]=data.features[i].properties.phases;


	
}
calc_MagNorm()
//DataArray.push( JSON.parse(data));
//console.log(DataArray);

}

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
/*#############################################################################################################################
 * ################################### @author ${Ebraheem_kashkoush} 										###################
 * ################################### 			HEAT MAP FUNCTIONS									 	    ###################
 * ################################### tags: #heatmap											            ###################
 * ############################################################################################################################
 * 
 */
function draw()
{
	
	
	 DataArray = DataArray.map(function (p) { 
		 return [p[0], p[1],p[3]]; });

	 heat = L.heatLayer(DataArray).addTo(map);
}

function draw_allMap(){
	MAX_MAG=AllMaxMag;
	DataArray=[];
	DataArray.length=0;
	DataArray=DataArray2;
	

	draw();


}
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
/*#####################################################################################################################
 * ###################################           													###################
 * ###################################Circles vis 	                                                ###################
 * ################################### tags: #Circles												###################
 * ####################################################################################################################
 * 
 */

function CirclesON(){
 	//select the map area and bounds
	var w =window.screen.availWidth;
	var h =  window.screen.availHeight*0.8;
	selectWh(w,h);
	//getPanes() : Returns an object with different map panes (to render overlays in)
	//overlayPane() : Pane for overlays like polylines and polygons.
	var svg = d3.select(map.getPanes().overlayPane).append("svg"),
	//The SVG <g> element is used to group SVG shapes together. Once grouped you can transform the whole 
	//group of shapes as if it was a single shape. This is an advantage compared to a nested <svg> element
	//which cannot be the target of transformation by itself
	
	//leaflet-zoom-hide : class to the DOM elements you create for the layer so that it hides during zoom animation. 
	//Implementing zoom animation for custom layers is a complex topic and will be documented separately in future,
	//but meanwhile you can take a look at how it's done for Leaflet layers (e.g. ImageOverlay) in the source.
    g = svg.append("g").attr("class", "leaflet-zoom-hide"),
     color = d3.scale.log()
     //max sig value is 1000 the the value interpolate bettwen this color
        .domain([166, 266, 566 ,1000 ])
        .range(["#377eb8", "#4daf4a", "#e41a1c"])//color range
        .interpolate(d3.interpolateHcl);//interpolate it wiht HCL color not LAB

d3.json(data, function(collection) {
    var path = d3.geo.path().projection(project),
        feature = g.selectAll("path").data(data.features).enter()
            .append("path") .attr('fill', get_color);
     path.pointRadius(function (d) {
        var mag = d.properties.mag;
        return mag * mag;
    }
    
    );
   //viewreset : Fired when the map needs to redraw its content (this usually happens on map zoom or load). Very useful for creating custom overlays.
    map.on('viewreset', reset);
    reset();

    function reset() {
var Ds=project([bounds.getSouthWest().lng,bounds.getSouthWest().lat])[1],
	Dw=project([bounds.getSouthWest().lng,bounds.getSouthWest().lat])[0],
	Dn= project([bounds.getNorthEast().lng,bounds.getNorthEast().lat])[1],
	De= project([bounds.getNorthEast().lng,bounds.getNorthEast().lat])[0]; 	

g   .attr("transform", "translate(" + -1 * (Dw ) + "," + -1 * (Dn ) + ")");

			svg    .attr("height", Ds-Dn ).attr("width",De-Dw )
            //we need to margin because in zooming the bounds is change and we need to marg them 
            .style("margin-left",Dw + "px").style("margin-top", Dn  + "px");

        feature.attr('d', path)
            .attr("fill-opacity", 0.6)
             .on("mouseover", function() {
            	 d3.select(this).attr("fill-opacity", 1)
                 .attr("stroke-width",2)
                 .attr('stroke', "red");

             })
             
             .on("mouseout", function() {
            	 d3.select(this).attr("fill-opacity", 0.6)
                 .attr("stroke-width",0)
 
             });
            
     }


    function project(x) {
        var point = map.latLngToLayerPoint([x[1], x[0]]);
        return [point.x, point.y];
    }

    function get_Sig(d) {    	
    	//sig: A number describing how significant the event is. Larger numbers indicate a more significant event.
    	//This value is determined on a number of factors, including: magnitude, maximum MMI, felt reports, and estimated impact.
        return d.properties.sig;
    }

    function get_color(d) {
        return d3.rgb(color(get_Sig(d))).toString();
    }
});




}
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

/*#############################################################################################################################
 * ################################### @author ${Ebraheem_kashkoush} 										###################
 * ################################### 		 INIT() FUNCTIONS										 	    ###################
 * ################################### tags: #INIT  											            ###################
 * ############################################################################################################################
 */
function initMap(){
	// container = L.DomUtil.get('map'),
   // map = L.map(container).setView([-43.6, 172.3], 10);

	map = L.map('map').setView([0, 0], 2);
	/* map = new L.Map('map', {
		  center: bounds.getCenter(),
		  zoom: 5,
		  layers: [osm],
		  maxBounds: bounds,
		  maxBoundsViscosity: 1.0
		});
	 */tiles = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map);
	 currentmap=tiles;
}
function style_init(){
	var x= document.getElementsByClassName("tablinks");
	 var i;
	 for (i = 0; i < x.length; i++) {
	     x[i].style.display='block' ;
	 }
	 x= document.getElementsByClassName("FRSTNON");
	 for (i = 0; i < x.length; i++) {
	     x[i].style.display='none' ;
	 }
}
function init(){
	style_init();
	lastclick=0;
	MAX_MAG=0;
	BuildRegionArr();
	Data("jasonData");
	DataArray2=DataArray;
	initMap();
	draw();
	AllMaxMag=MAX_MAG;
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
    	map.removeLayer(currentmap);
    	currentmap= L.tileLayer('http://{s}.tile.stamen.com/terrain/{z}/{x}/{y}.png', {
    	    maxZoom: 17
    	  }).addTo(map);
    	 break;
    case 'toner':
    	map.removeLayer(currentmap);
    	currentmap=L.tileLayer('http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png', {
    		    maxZoom: 17
    		}).addTo(map);
    	 break;
    case 'OpenStreetMap' :
    	map.removeLayer(currentmap);
    	currentmap= L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    	}).addTo(map);
        break;
    case 'watercolor':
    	map.removeLayer(currentmap);
    	currentmap= L.tileLayer('http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.png', {
 		    maxZoom: 17
 		}).addTo(map);
    	break;
    	
    case 'outdoors' :
    	
    	map.removeLayer(currentmap);
    	currentmap=	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
			maxZoom: 18,
			id: 'mapbox.outdoors'
		}).addTo(map);
    	break;

    case 'dark' :
    	map.removeLayer(currentmap);
    	currentmap=L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
			maxZoom: 18,
			id: 'mapbox.dark'
		}).addTo(map);
    	break;    
    case 'light' :
    	map.removeLayer(currentmap);
    	currentmap=L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
			maxZoom: 18,
			id: 'mapbox.light'
		}).addTo(map);
    	break;   
    case 'satellite' :
    	map.removeLayer(currentmap);
    	currentmap=L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
			maxZoom: 18,
			id: 'mapbox.satellite'
		}).addTo(map);
    	break; 
    case 'streets' :
    	map.removeLayer(currentmap);
    	currentmap= L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
			maxZoom: 18,
			id: 'mapbox.streets'
		}).addTo(map);
    	break; 
    	streets
    }



   
}

window.onLoad =init();



