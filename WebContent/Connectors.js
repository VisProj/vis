var RawData =null;




setTimeout( (function() {
	  var flickerAPI = "http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?";
	  $.getJSON( "http://localhost:8081/ParallelVisualization/data/month.json", {
	    format: "json"
	  })
	    .done(function( data ) {
	    RawData =data;
	    console.log("herer");
	    console.log(data);
	    /*
	      $.each( data.items, function( i, item ) {
	    	  	RawData.push(item);
	      
	      });
	      
	      */
	    });
	})());

setTimeout(function (){
	console.log("sss");
	console.log(RawData)}
,10000);

function GetSelectedDataFromParrallel (Selected_data)
{
	
	/* Get all the quakes */
	
			var data = RawData;
	    	console.log("Entered");
	    
	    	var selected_result = new Array(); /* contains the selected dotes from the raw data  */
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
			//console.log(data.features[9]);
			var temp;
			var geo_point;
			
			console.log("length : " , l);
			for(i=0;i<l;i++)
			{
				/**  for each earthquake check if it's location matches to one of the selected data locations then mark it **/
				temp=data.features[i].properties;
				geo_point=data.features[i].geometry.coordinates;
				Location = GetLocation1(temp.place);
				if(Locations_arr[Location])
				{
		
					/*push the current point (earthquake */
					selected_result.push({"longitude":geo_point[0],"latitude":geo_point[1],"depth":geo_point[2],"mag":temp.mag,"sig":temp.sig,"place":temp.place});
				}
			}
		
			console.log(selected_result);
			
		
			console.log("Exit");
			
			/********************************
			 *   here call , your function from here and give it "selected_result"
			 ************************************/
		
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

function getRawData()
{
	RawData =$.ajax({
	    url : "data/month.json",
	    error : function() {
	        alert("Error Occured while quering the data");
	    },
	    success : function(data)
	    {
	    	alert(data.features[0]);
	    	return data.features; //RawData=data.features;
	    }
	});

}