var RawData =null;
/*
 * an array containing all the  locaton in the map that were tatgged as "Other"
 * */
var Location_Other =null;
function setOthers(Others)
{
	Location_Other = Others;
	console.log();
	console.log(Location_Other);
}


setTimeout( (function() {

	$.getJSON( "http://localhost:8080/vis/data/month.json", {
	    format: "json"
	  })
	    .done(function( data ) {
	    RawData =data;
	
	    });
	})());


function GetSelectedDataFromParrallel (Selected_data)
{
	
	/* Get all the quakes */
	
			var data = RawData;
	    	console.log("Entered");
	    
	    	var selected_result = new Array(); /* contains the selected dotes from the raw data  */
	    	var selected_features = new Array();
	        var i=0;
	        var Location ="";
	        var all_locations;
	        var SD_length= Selected_data.length;
	    	var Locations_arr = [];
	    	var allLocations="";
	    	var index = 0; 
	    	/* first get all locations for the data  */
	    	
	    	for(i=0;i<SD_length;i++)
	    	{
	    		Location = Selected_data[i].Location;

		    	
	    		if(allLocations.indexOf(Location)== -1)
	    		{
	    			Locations_arr[Location]= index;
	    			index ++;
	    			allLocations=allLocations + ","+Location;
	    		}
	    	}
	    	
	    	var l = data.features.length; 
			var temp;
			var geo_point;
			
			console.log("length : " , l);
			var coordinants ;
			for(i=0;i<l;i++)
			{
				/**  for each earthquake check if it's location matches to one of the selected data locations then mark it **/
				temp=data.features[i].properties;
				geo_point=data.features[i].geometry.coordinates;
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
