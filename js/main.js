$(document).on("mobileinit",function(e)
{

});

$(document).on("pageinit","#page-1",function(e)
{
	var SHEET_KEY = "1rAjKvg9Y-iTVUkupCs1rVhuCVQiMnHixfARAuUhQ1Us";
	var SHEET_COUNT = 3;
	var team_num = 0;

	var parseAddressBook = function(json)
	{
		var e = json.feed.entry;
		if(e != undefined )
		{
			var item_length = e.length;

			var result_listview = $("#result-listview-id");
			result_listview.empty();
			for (var i = 0; i < item_length; i++) 
			{
				entry  = e[i];
				house  = entry.gsx$house.$t;
				//team   = entry.gsx$team.$t;
				name   = entry.gsx$name.$t;
				phone  = entry.gsx$phone.$t;
				lineid = entry.gsx$lineid.$t;
				//id 	   = entry.gsx$id.$t;
				//sex    = entry.gsx$sex.$t;
				//role   = entry.gsx$role.$t;

				result_listview.append("<li>"+"<h3>"+name+"</h3>"+phone+" / "+lineid+"<span class ='ui-li-count'>"+house+"</span>"+"</li>");
			}
			result_listview.listview("refresh");
		}
	};

	var searchTeamByID = function(json)
	{
		var e = json.feed.entry;

		//found data
		if(e != undefined && team_num == 0)
		{
			//"https://spreadsheets.google.com/feeds/list/1rAjKvg9Y-iTVUkupCs1rVhuCVQiMnHixfARAuUhQ1Us/2/public/values/cpzh4"
			var url = e[0].id.$t
			var arr = url.split('/');
			for(var i = 0; i < arr.length-1; i++)
			{
				if(arr[i] == SHEET_KEY)
				{
					team_num = arr[i+1];
					var title = $("#result-title-id");
					title.text("這是第 "+team_num+"分隊的通訊錄");
					$.getJSON("https://spreadsheets.google.com/feeds/list/"+SHEET_KEY+"/"+team_num+"/public/values?alt=json-in-script&callback=?", parseAddressBook);
					break; 
				}
			}	
		}
	};
	var onBtnQueryClick = function (e)
	{
		var query_id = $("#input-user-id").val();

		//clean data
		$("#input-user-id").val("");
		var result_listview = $("#result-listview-id");
		result_listview.empty();
		team_num = 0;
		var title = $("#result-title-id");
		title.text("");

		//search team number by ID
		if(query_id != undefined && query_id != "")
		{
			for(var index = 1; index <= SHEET_COUNT; index++)
			{
				if(team_num == 0)
					$.getJSON("https://spreadsheets.google.com/feeds/list/"+SHEET_KEY+"/"+index+"/public/values?alt=json-in-script&callback=?&q="+query_id, searchTeamByID);
				else
					break;
			}
		}
	}

	$("#btn-query").on("click",onBtnQueryClick);
});