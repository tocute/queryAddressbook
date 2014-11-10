$(document).on("pageshow","#page-map",function(e)
{
    var team_num = 0;
    var ADDRESS_BOOK_SHEET_KEY = "1rAjKvg9Y-iTVUkupCs1rVhuCVQiMnHixfARAuUhQ1Us";
    var VOTE_HOUSE_SHEET_KEY = "1qgXXxMv6krKWwAPXALgOLQtklmE0i7i_HT9s0RT1K4M";
    //https://docs.google.com/spreadsheets/d/1qgXXxMv6krKWwAPXALgOLQtklmE0i7i_HT9s0RT1K4M/pubhtml
    $('#popupInfoDlg').css({'width':$(window).width()*0.8});
    $('#popupWarningDlg').css({'width':$(window).width()*0.8});

    var showAlert = function (msg)
    {
        $("#popupWarningDlg #popupText").html(msg);
        $("#popupWarningDlg").popup( "open" );
    }

    var showInfoDlg = function (result)
    {
        var result_listview = $("#vote-house-listview-id");
        var item_length = result.length;
        result_listview.empty();
        for (var i = 0; i < item_length; i++) 
        {
            var entry  = result[i];
            var voteHouseId  = entry.gsx$votehouseid.$t;
            var name  = entry.gsx$name.$t;
            var phone = entry.gsx$phone.$t;
            var email = entry.gsx$email.$t;
            var state = entry.gsx$state.$t;
            var anotherName = entry.gsx$anothername.$t;
            var anotherTel = entry.gsx$anothertel.$t;

            if( i == 0)
            {
                $("#vote_house_id").text("投票所 : "+voteHouseId);
            }

            var anotherInfo = "";
            if(anotherName != undefined && anotherName != "")
            {
                anotherInfo = "<br>陪伴者資訊: "+anotherName+" / "+anotherTel;
            }
            result_listview.append("<li>"+"<h3>"+name+"</h3>"+phone+" / "+email+" / "+state+anotherInfo+ "</li>");
        }
        result_listview.listview("refresh");
        $("#popupInfoDlg").popup( "open" );
    };

    var parseVoteHouseInfo = function(json)
    {
        var result = json.feed.entry;
        if(result != undefined )
        {
            showInfoDlg(result);
        }
        else
            showAlert("該投票所查無資料");
    };

    var parseVoteHouse = function(json)
    {
        var result = json.feed.entry;
        if(result != undefined )
        {
            var item_length = result.length;
            var map_options = { zoom:17, mapTypeId:google.maps.MapTypeId.ROADMAP};
            var map = new google.maps.Map(document.getElementById("map"),map_options);
            $("#map").height(window.innerHeight - 190);
            google.maps.event.trigger(map, 'resize');
            var bounds = null;
            var image = "images/house.png";
            for (var i = 0; i < item_length; i++) 
            {
                var entry = result[i];
                voteHouseId = entry.gsx$votehouseid.$t;
                address = entry.gsx$address.$t;
                latitude = entry.gsx$latitude.$t;
                longitude = entry.gsx$longitude.$t;

                //updateMap
                var geolocaion = new google.maps.LatLng(latitude,longitude);
                if(i == 0)
                { 
                    bounds = new google.maps.LatLngBounds(geolocaion);                  
                }
                else
                {
                    bounds.extend(geolocaion);
                    map.fitBounds(bounds);
                }
  
                var marker = new google.maps.Marker({
                    position: geolocaion,
                    map: map,
                    title: voteHouseId,
                    icon: image
                });
                
                google.maps.event.addListener(marker, 'click', function(e) 
                {
                    $.getJSON("https://spreadsheets.google.com/feeds/list/"+ADDRESS_BOOK_SHEET_KEY+"/1/public/values?alt=json-in-script&callback=?&sq=votehouseid="+this.title, parseVoteHouseInfo);  
                    map.setCenter(this.getPosition());

                });
            }
        }
        else
            showAlert("查無 "+team_num+" 分隊資料");
    };
    
    var initPage = function ()
    {
        team_num = localStorage["TEAM_NAME"];
        var title = $("#map-title-id");
        title.text(team_num+" 分隊的投票所分佈");

        //map

        if(team_num != undefined && team_num != "")
        {
            $.getJSON("https://spreadsheets.google.com/feeds/list/"+VOTE_HOUSE_SHEET_KEY+"/1/public/values?alt=json-in-script&callback=?&sq=team="+team_num, parseVoteHouse);
        }
        else
            showAlert("請輸入身分證字號");
    };

    initPage();
});