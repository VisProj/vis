

var Other_locations = new Array() ; // an array that contains all the locations that were classified as others


function GetJsonData()
{
var jsdata;
$.ajax({

        url : "data/month.json",
      //  dataType : 'obj',
    
        error : function() {
            //alert("Error Occured while quering the data");
        },
        success : function(data) {
       
       var res = datamining(data.features);
        	parcoords
            .data(res)
            .color(color)
            //.scale(x)
            .hideAxis(["name"])
            .composite("darker")
            .render()
            .shadows()
            .reorderable()
            .brushMode("1D-axes");  // enable brushing
        
        	console.log("testing ");
    
        	console.log("testing end ");
        }
    });

}

function UpdateHeatMapData(HMData)
{
	
	d3.select("svg").remove();
    var res = datamining(data.HMData);
	parcoords
    .data(res)
    .color(color)
    //.scale(x)
    .hideAxis(["name"])
    .composite("darker")
    .render()
    .shadows()
    .reorderable()
    .brushMode("1D-axes");  // enable brushing
}



// quantitative color scale
var blue_to_brown = d3.scale.linear()
  .domain([1, 50])
  .range(["red", "green"])
  .interpolate(d3.interpolateLab);

var color = function(d) { return blue_to_brown(d['economy (mpg)']); };

var parcoords = d3.parcoords()("#paralleldiv")
    .alpha(0.4);

var x = d3.scale.log()
.domain([.0124123, 1230.4])
.range([0, 900]);

var sltBrushMode = d3.select('#sltBrushMode')

sltBrushMode.selectAll('option')
  .data(parcoords.brushModes())
  .enter()
    .append('option')
    .text(function(d) { return d; });

sltBrushMode.on('change', function() {
  parcoords.brushMode(this.value);
  switch(this.value) {
  case 'None':
    d3.select("#pStrums").style("visibility", "hidden");
    d3.select("#lblPredicate").style("visibility", "hidden");
    d3.select("#sltPredicate").style("visibility", "hidden");
    d3.select("#btnReset").style("visibility", "hidden");
    break;
  case '2D-strums':
    d3.select("#pStrums").style("visibility", "visible");
    break;
  default:
    d3.select("#pStrums").style("visibility", "hidden");
    d3.select("#lblPredicate").style("visibility", "visible");
    d3.select("#sltPredicate").style("visibility", "visible");
    d3.select("#btnReset").style("visibility", "visible");
    break;
  }
});

sltBrushMode.property('value', '1D-axes');

d3.select('#btnReset').on('click', function() {parcoords.brushReset();})
d3.select('#sltPredicate').on('change', function() {
  parcoords.brushPredicate(this.value);
});




function datamining(data)
{
	// data is a json object (array of arrays )
	var i;
	var data_length = data.length ; 
	var data_result = new Array();
	var Location ; 
	var info_accuracy;
	var depth;
	var max_depth= -1;
	var min_depth= 500;
	
	for(i=0;i<data_length; i++)
	{
		Location = GetLocation(data[i].properties.place);
		info_accuracy = 0;//GetAccuracy(data.properties[i]) ;
		depth = data[i].geometry.coordinates[2];
		if(isNaN(depth))
		{
			depth =-1;	
		}
		data_result.push({"Location":Location,"mag":data[i].properties.mag,"depth":depth,"sig":data[i].properties.sig});
		
	}
	
	data_result = MergeEarthQuakesDataByLocation(data_result);
	return data_result;
}

function MergeEarthQuakesDataByLocation(data)
{
	/* if two quakes in the data have the same location , then merge them into one ; 
	*
	**/
	var i ; 
	var data_length  = data.length;	
	var location = "";
	var result = new Array(); 
	var indexOfLocation = new Array();
	var allLocations = "";
	var index  = 0;
	var Locations_arr = [];
	
	/*initiate result with first element , for later uses 
	 * */
	result.push({"Location":"Others","number":0,"mag":0,"depth":0,"sig":0,"HighAlerts":0});
	
	/* Get a String with all the diffrent locations of the earthquakes in the data of the format "location1,location2,...,locationN"
	* initialize a data Arrya with all locations . 
	*/
	for(i=0;i<data_length;i++)
	{
		Location = data[i].Location;
		if(allLocations.indexOf(Location)== -1)
		{
			allLocations +=  Location +","; 
			result.push({"Location":Location,"number":0,"mag":0,"depth":0,"sig":0,"HighAlerts":0});
			indexOfLocation.push({"Location":Location,"index":index});
			
			Locations_arr[Location]= index;
			index++;
		}
	}
	
	
	var x;
	for(i=0;i<data_length; i++)
	{
		
		Location = data[i].Location;
		x=Locations_arr[Location];
		if(result[x]!= undefined)
		{
			result[x].mag = result[x].mag  + parseFloat(data[i].mag);
			result[x].depth = result[x].depth  + parseInt(data[i].depth);
			result[x].number = result[x].number  +1;
			//result[x].Accuracy = result[x].Accuracy  +data[i].Accuracy;
			result[x].sig = result[x].sig  + parseInt(data[i].sig);
			
		
			if(result[x].mag >=4.5)
			{
				result[x].HighAlerts = result[x].HighAlerts  +1;
			}
		}
	}
	
	/* due to the high number of  Diffrent locations , we want to join  All the Locations that have   <=  thresh hold (in this case 50) 
	 * earthquakes , we refer to the joined element by "Others "  ( which is the first element of result array
	 */
	var dyn_length = result.length;
	var thresh = 20;
	for(i=1;i<dyn_length; i++)
	{
		
		if(result[i].number <=thresh )
		{	// add the current earthquake to "Others" (results[0])
			result[0].mag = result[0].mag + result[i].mag;
			result[0].depth = result[0].depth + result[i].depth;
			result[0].number = result[0].number + result[i].number;
		//	result[0].Accuracy = result[0].Accuracy + result[i].Accuracy;
			result[0].sig = result[0].sig + result[i].sig;
			result[0].HighAlerts = result[0].HighAlerts + result[i].HighAlerts;
	
			//add the location to Others locaation list 
			Other_locations.push("Location",result[i].Location);
			
			//remove the query from results .
			result.splice(i,1);
			i=i-1;
			dyn_length=dyn_length-1;
	
			
		}
	}
	
	// Set Otther locations variable in connectors.js 
	setOthers(Other_locations);
	
	//merge two Earthquakes with the same location 
	console.log("data length  "+ result.length);
	console.log(Locations_arr);
	
	
	
	/** Normalize the Data ***/
	var results_length = result.length;
	var norm = 1;

	var count =0;
	var max_depth=0;
	var min_depth=1000;
	for(i=0;i<results_length;i++)
	{
		norm =result[i].number;
		
		result[i].mag = result[i].mag/norm; 
		//if(isNaN(result[i].mag)) alert("gere");
		result[i].depth = result[i].depth/norm ; 
		if(isNaN(result[i].depth)) 
		{
			count++;
			result[i].depth= 0;
		}
		result[i].sig = result[i].sig/norm;
		//result[i].Accuracy =result[i].Accuracy/norm;
	}

	console.log("*************************************************");	

	return result;
}
function GetAccuracy(earthquake)
{
	
	/** calculate the information Accuracy of the earthquake  */
	
	/* nst : [1,200] 
	*	the total number of seismic stations used to determine earthquake location (the higher te better)
	*/
	var nst = earthquake.nst;
	if(nst==null )
	{
		nst = 1;
	}
	nst = (nst /200 ) *10;
	
	/* gap  : [0.0,180.0]
	* the largest azimuthal gap between azimuthally adjacent stations (in degrees). 
	* the smaller this number , the more reliable is the calculated horizontatl position of the earthquake . 
	*/
	var gap = earthquake.gap; 
	if(gap == null ) gap=180;
	gap = gap = ((180-gap)/180)*10;
	
   /*dmin : Horizantal distance from the epicenter of the nearest station (in degree ) , 1edgreee ~ = 111.2 killomiters  
	*the smaller this number the more reliable is the calculated depth .  range [0.4,7.1]
	*/
	var dmin = earthquake.dmin; 
	dmin = (7.1-dmin)/6.7 *10 ; //(7.1-dmin)/(7.1-0.4)
	
	/* horizontalError:  [0,100]
	* uncertainty of reported location of the event in kilometers 
	*/
	var horizontalError = earthquake.horizontalError;
	horizontalError = (100 - horizontalError)*0.2;

	/* depthError : [0,100]
	*uncertainty of reported depth of the event in kilometers 
	*/
	var depthError = earthquake.depthError;
	depthError =(100-depthError)*0.2;
	/* magError : [0,100]
	* uncertainty of reported magnitude of the event  
	**/
	var magError = earthquake.magError;
	magError = (100-magError)*0.3;
	/*
	* accuracy is the total accuracy of the earthquake . 
	*/
	var accuracy  = magError+ depthError + horizontalError+dmin+gap +nst;
	return parseInt(accuracy); 
}


function init()
{
	GetJsonData();
}
function GetLocation(Location)
{
	// location is a string of the foramt : [ distans in kilometers (North/South/west.east) of "landmark " , city ]
	// for exampe : 3km ESE of The Geysers, California
	// we only need the city 
	var temp=Location.split(",");
	if(temp.length==1)
		return "Others";
	return temp[temp.length-1];
}


init();






