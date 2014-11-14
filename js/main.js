$(document).on("mobileinit",function(e)
{

});


$(document).on("pageinit","#page-1",function(e)
{
    var team_num = 0;
    var SHEET_KEY = "1rAjKvg9Y-iTVUkupCs1rVhuCVQiMnHixfARAuUhQ1Us";

    var showAlert = function (msg)
    {
        $("#popupWarningDlg #popupText").html(msg);
        $("#popupWarningDlg").popup( "open" );
    }

    var parseAddressBook = function(json)
    {
        var result = json.feed.entry;
        if(result != undefined )
        {
            var item_length = result.length;

            var result_listview = $("#result-listview-id");
            result_listview.empty();
            for (var i = 0; i < item_length; i++) 
            {
                var entry  = result[i];
                voteHouseId  = entry.gsx$votehouseid.$t;
                name  = entry.gsx$name.$t;
                phone = entry.gsx$phone.$t;
                email = entry.gsx$email.$t;

                result_listview.append("<li>"+"<h3>"+name+"</h3>"+phone+" / "+email+"<span class ='ui-li-count'>"+voteHouseId+"</span>"+"</li>");
            }
            result_listview.listview("refresh");
        }
        else
            showAlert("查無 "+team_num+" 分隊資料");
        
        $.mobile.loading( 'hide');
    };

    var searchTeamByID = function(json)
    {
        /*
        "gsx$時間戳記":{"$t":"2014/9/12 上午 12:37:33"},
        "gsx$votehouseid":{"$t":"32423"},
        "gsx$team":{"$t":"1"},
        "gsx$name":{"$t":"Wayne Fu"},
        "gsx$id":{"$t":"a"},"gsx$phone":{"$t":"0918-234-532"},
        "gsx$email":{"$t":"buk"},
        "gsx$state":{"$t":""},
        "gsx$anothername":{"$t":"bill"},
        "gsx$anothertel":{"$t":"981"}*/

        var result = json.feed.entry;
        
        //found data
        if(result != undefined && result.length > 0)
        {
            //"https://spreadsheets.google.com/feeds/list/1rAjKvg9Y-iTVUkupCs1rVhuCV&QiMnHixfARAuUhQ1Us/2/public/values/cpzh4"
            var team_num = result[0].gsx$team.$t
            var title = $("#result-title-id");
            title.text(" "+team_num+" 分隊的通訊錄");
            //localStorage["TEAM_NAME"] = team_num;
            //document.getElementById("btn-map").href = "map.html?TEAM_NAME="+team_num;
            $("#btn-map").attr("href", "map.html?TEAM_NAME="+team_num);
            $("#btn-map").removeClass("ui-disabled");
            $.getJSON("https://spreadsheets.google.com/feeds/list/"+SHEET_KEY+"/1/public/values?alt=json-in-script&callback=?&orderby=column:votehouseid&reverse=false&sq=team="+team_num, parseAddressBook); 
        }
        else
        {
            showAlert("查無此人 請重新輸入身份字號");
            $.mobile.loading( 'hide');
        }   

    };
    
    var onQuerySubmit = function (e)
    {
        e.preventDefault();
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
            $.mobile.loading( 'show', {
            text: '通訊錄查詢中...',
            textVisible: true,
            theme: 'z',
            html: ""
            });
            $.getJSON("https://spreadsheets.google.com/feeds/list/"+SHEET_KEY+"/1/public/values?alt=json-in-script&callback=?&sq=id="+query_id, searchTeamByID);
        }
        else
            showAlert("請輸入身分證字號");
        return false;
    }
    $("#form-query").on("submit", onQuerySubmit);
    // $("#btn-query").on("click",onBtnQueryClick);
});