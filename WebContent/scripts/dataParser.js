function GetDataInArray()
{
	/*returns the subject list in the exam */
	$.ajax({

        url :"../data/all_hour.csv",
        dataType : 'json',
        error : function() {

            alert("Error Occured");
        },
        success : function(data) {
				document.getElementById("demo").innerHTML +=  "";
        }
    });
	
}