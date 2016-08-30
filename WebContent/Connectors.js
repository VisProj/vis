var RawData =null;
/*
 * an array containing all the  locaton in the map that were tatgged as "Other"
 * */
var Location_Others =null;
function setOthers(Others)
{
	Location_Others = Others;
	console.log("all otherr locations ");
	console.log(JSON.stringify(Location_Others));
}

function Connectorsinit()
{

setTimeout( (function() {

	$.getJSON( "./data/month.json", {
	    format: "json"
	  })
	    .done(function( data ) {
	    RawData =data;
	    console.log(RawData.features[0]);
	
	    });
	})());
}

function GetSelectedDataFromParrallel (Selected_data)
{
	
	/* Get all the quakes */
	
			var data = RawData.features;
	    
	    	var selected_result = new Array(); /* contains the selected dotes from the raw data  */
	    	var selected_features = new Array();
	        var i=0;
	        var Location ="";
	        var all_locations;
	        var SD_length= Selected_data.length;
	    	var Locations_arr = [];
	    	var allLocations="";
	    	var index = 0; 
	    	/* first get all locations from the selected data  */
	    	
	    	for(i=0;i<SD_length;i++)
	    	{
	    		Location = Selected_data[i].Location;

	    		if(allLocations.indexOf(Location)== -1)
	    		{
	    			if(Location == "Others")
    				{
	    				for(var j=0;j<Location_Others.length; j++)
    					{
	    					Locations_arr[Location_Others[i].Location]= index;
	    					index++;
    					}
    				}
	    			else
	    			{	
		    			Locations_arr[Location]= index;
		    			index ++;
		    			allLocations=allLocations + ","+Location;
	    			}
	    		}
	    	}
	    	
	    	var l = data.length; 
			var temp;
			var geo_point;
			
			var coordinants ;
			for(i=0;i<l;i++)
			{
				/**  for each earthquake check if it's location matches to one of the selected data locations then mark it **/
				temp=data[i].properties;
				geo_point=data[i].geometry.coordinates;
				Location = GetLocation1(temp.place);
				if(Locations_arr[Location])
				{//"longitude":geo_point[0],"latitude":geo_point[1],"depth":geo_point[2]
					coordinants=[geo_point[0],geo_point[1],geo_point[2]];
					selected_features.push({"properties":{"mag":temp.mag,"sig":temp.sig,"place":temp.place},"geometry":{"coordinates":coordinants}});
				
				}
		
			}
		
			selected_result ={"features":selected_features};
			var json_data= JSON.parse(JSON.stringify(selected_result));
			REINIT(json_data);
		
}


function GetLocation1(Location)
{
	// location is a string of the foramt : [ distans in kilometers (North/South/west.east) of "landmark " , city ]
	// for exampe : 3km ESE of The Geysers, California
	// we only need the city 
	var temp=Location.split(",");
	if(temp.length==1)
		return "Others";
	return temp[temp.length-1];
}

function  updateParallelVisData(heatData)
{
//heatData[i] = (long,lat,depth,mag) 
	console.log("heatmap data ", heatData[0]);
	console.log("RawDdata",RawData.features[0]);
	
	//UpdateHeatMapData(heatData);

}
function findCoordinantsInData(lat, long)
{
	
	var i=0;
	var RD_length= RawData.length;
	console.log("RawDdata",RawData.features[0]);
	
	for(i=0;i<0 * RD_length;i++)
	{
		if(RawData[i]);
	}

}




