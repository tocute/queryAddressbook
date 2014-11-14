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
        var result_listview = $("#dlg-vote-house-listview-id");
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
                anotherInfo = "<br>陪伴者資訊 : "+anotherName+" / "+anotherTel;
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
            var map_options = { 
                zoom:17, 
                mapTypeId:google.maps.MapTypeId.ROADMAP,
                panControl: false,
                mapTypeControl: false,
                streetViewControl: false,
                overviewMapControl: false};

            var map = new google.maps.Map(document.getElementById("map"),map_options);
            $("#map").height(window.innerHeight*0.5);
            google.maps.event.trigger(map, 'resize');
            var bounds = null;
            var image = "images/img_vote_house.png";

            var result_listview = $("#vote-house-listview-id");
            result_listview.empty();

            result_listview.on('click', 'li', function(e) 
            {
                var vote = $(e.currentTarget).data('vote')
                var voteHouseId = vote.voteHouseId;
                var lat = vote.latitude;
                var lng = vote.longitude;
                var geolocaion = new google.maps.LatLng(lat,lng);
                $.getJSON("https://spreadsheets.google.com/feeds/list/"+ADDRESS_BOOK_SHEET_KEY+"/1/public/values?alt=json-in-script&callback=?&sq=votehouseid="+voteHouseId, parseVoteHouseInfo);  
                map.setCenter(geolocaion);
            });

            for (var i = 0; i < item_length; i++) 
            {
                var entry = result[i];
                voteHouseId = entry.gsx$votehouseid.$t;
                address = entry.gsx$address.$t;
                latitude = entry.gsx$latitude.$t;
                longitude = entry.gsx$longitude.$t;
                var vote = {voteHouseId:voteHouseId,latitude:latitude,longitude:longitude};

                $("<li><a data-role='button'>"+"<h3>投票所編號 :"+voteHouseId+"</h3>"+address+ "</a></li>")
                .data('vote', vote)
                .appendTo(result_listview);

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
            result_listview.listview("refresh");
        }
        else
            showAlert("查無 "+team_num+" 分隊資料");

        $.mobile.loading( 'hide');
    };
    
    var initPage = function ()
    {
        //team_num = localStorage["TEAM_NAME"];
        var query_string = {};
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i=0;i<vars.length;i++) 
        {
            var pair = vars[i].split("=");
            // If first entry with this name
            if (pair[0] === "TEAM_NAME") 
            {
                team_num = decodeURIComponent(pair[1]);
                break;
            }
        }

        var title = $("#map-title-id");
        title.text(team_num+" 分隊的投票所分佈");

        //map

        if(team_num != undefined && team_num != "")
        {
            $.mobile.loading( 'show', {
            text: '地圖載入中...',
            textVisible: true,
            theme: 'z',
            html: ""
            });

            $.getJSON("https://spreadsheets.google.com/feeds/list/"+VOTE_HOUSE_SHEET_KEY+"/1/public/values?alt=json-in-script&callback=?&sq=team="+team_num, parseVoteHouse);
        }
        else
            showAlert("請輸入身分證字號");
    };

    initPage();
});