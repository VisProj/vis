var RawData =null;
/*
 * an array containing all the  locaton in the map that were tatgged as "Other"
 * */
var Location_Others =null;
function setOthers(Others)
{
	Location_Others = Others;

}

function Connectorsinit(data)
{

	RawData =data;
/*setTimeout( (function() {

	$.getJSON( "./data/month.json", {
	    format: "json"
	  })
	    .done(function( data ) {
	    RawData =data;
	
	    });
	})());*/
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

	    		if(allLocations.indexOf(Location) == -1)
	    		{
	    			// if it's a new location , then add it to either "Others" or as a new Location
	    			if(Location == "Others")
    				{
	    				for(var j=0;j<Location_Others.length; j++)
    					{
	    	
	    					Locations_arr[Location_Others[j].Location]= index;
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
				if(Locations_arr[Location]!= null)
				{//"longitude":geo_point[0],"latitude":geo_point[1],"depth":geo_point[2]
					coordinants=[geo_point[0],geo_point[1],geo_point[2]];
					selected_features.push({"properties":{"mag":temp.mag,"sig":temp.sig,"place":temp.place},"geometry":{"coordinates":coordinants}});
				}
				//else m the location is already found in the locations array
		
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
		return "other";
	return temp[temp.length-1];
}


function  updateParallelVisData(heatData)
{
//heatData[i] = (long,lat,depth,mag) 
	console.log("heatmap data ", heatData[0]);
	console.log("RawDdata",RawData.features[0]);
	var data=RawData.features;
	var i,j;
	var long,lat;
	var data_length =data.length;
	var heatData_length =heatData.length;
	var resData = new Array();
	var Location ,depth;
	
	console.log("sdsd" ,data[0]);
	for(i=0;i<heatData_length;i++)
	{
		
		lat = heatData[i][0];
		long = heatData[i][1];
		for(j=0;j<data_length;j++)
		{	
			if(data[j].geometry.coordinates[0] == long && data[j].geometry.coordinates[1] == lat)
			{
				depth = data[i].geometry.coordinates[2];
				if(isNaN(depth))
				{
					depth =-1;	
				}	
				Location =GetLocation1(data[j].properties.place);
				resData.push({"Location":Location,"mag":data[j].properties.mag,"depth":depth,"sig":data[j].properties.sig});
			}
		}	
	}

	UpdateHeatMapData(resData);

}




