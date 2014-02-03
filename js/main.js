const SPEED = 100;
const STEPS = 288;
const SPE_DOT = SPEED*STEPS/(24*60*60);
const SPE_TRIP = SPEED*STEPS/(60*60*24*7);
const R_SMALL = 3;
const R_LARGE = 35;
const VIZ_DELAY = 1500; 

var STOP = false;
var map = {};

var state = '#about',
    w_h = $( window).height(),
    w_w = $( window ).width();

var STOP = false;

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

var focus_width = 1200,
    focus_height = 500;

var data, data_usr,
    usr = [],
    category = [],
    cateindex = [],
    total_h = new Array(8),
    total_c = [0,0,0,0,0,0,0,0], //total per category
    total_max = [0,0,0,0,0,0,0,0],
    index_t = [],
    cateid = {
    "Hom": 0,
    "Sho": 1,
    "Out": 2,               
    "Nig": 3,
    "Art": 4,
    "Tra": 5,
    "Foo": 6,
    "Col": 7
    },
    day = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
// "Home":306, "Sho":285, "Out":158, "Nig":24, "Art" : 46, "Tra" : 475, "Foo" : 224, "Col" : 74 
colorhex = {
    "Hom": "#3867B1",
    "Sho": "#A92B4D",
    "Out": "#2B7A3C",               
    "Nig": "#DF6235",
    "Art": "#F2B71A",
    "Tra": "#9ACA45",
    "Foo": "#E34A51",
    "Col": "#83CBF1",
    "Oth": "none"
};

var clen = Object.size(cateid);

var focus = d3.range(clen).map(function(i){ return {y:focus_height*(0.25+Math.floor(i/4)/2)+150, x:(i%4)*(focus_width-200)/(clen/2)+300};});

var vizTimerId = 0,
    updTimerId = 0,
    Tmout_t = [],
    Tmout_d = [],
    Tmout_m = [];


/***********************
*  UPDATE PAGE
************************/
function reBindhover(){
    $('.lense').each(function(index){
        
        var oldSrc = $(this).find('img').attr('src');
        var newSrc = oldSrc.replace(".svg","-hover.svg");
        var text = $("#desc-"+ (index+1)).text();
        
        $(this).hover(
            function(){
                $(this).find('.title').css('background','#D11D49');
                $(this).find('.title').css('color','#ffffff');
                $(this).find('img').attr('src', newSrc);
                $('#desc').text(text);
            },  
            function(){
                $(this).find('.title').css('background','#000000');
                $(this).find('.title').css('color','#ffffff');
                $(this).find('img').attr('src', oldSrc);  
                $('#desc').text("");                 
            }               
        ); // end hover
    }); //end each
}

function insertLayer(){
    $("<div id='overlay' class='temp'></div>").insertAfter("#map-zoombox-box");
}

$(window).ready(function(){
      
    var m_h = $("#map").css("height");
    
    $("#overlay").css("height",m_h);

    reBindhover();

    var image_width = $('#img-right').width();
    if (image_width == 0) image_width = 268;
    var overlay_height = $('#overlay').css("height").substring(0,3);

    mapbox.auto('map', 'heshan0131.gd2f0kpf', function(map){
           
        map.setZoomRange(12, 12);

        //Load data for #emerge, #collide, #stream
        d3.csv("data/Nov_08_2013.csv", function(raw_data){
                
                data = raw_data;
                data.forEach(function(d){
                    
                    if (d.category2 != "Others"){
                        //category doesn't exist, create category
                        if (cateindex.indexOf(d.category2) == -1) {
                            category.push({"id":d.category2,"cat":cateid[d.category2.slice(0,3)]});
                            total_h[cateid[d.category2.slice(0,3)]]={"cate":d.category2.slice(0,3),"values":[]};
                            for(var i = 0; i < 24; i++){
                                total_h[cateid[d.category2.slice(0,3)]].values.push({"step":i,"total":0});
                            }                   
                            cateindex.push(d.category2);
                        }
                        
                        var h = parseInt(d.created_time.substring(11,13));                  
                        total_h[cateid[d.category2.slice(0,3)]].values[h].total++;
                        total_c[cateid[d.category2.slice(0,3)]]++;
                        //record time index
                        index_t.push(parseTime(d.created_time));
                        
                        //record hourly max
                        if (total_h[cateid[d.category2.slice(0,3)]].values[h].total > total_max[cateid[d.category2.slice(0,3)]]) {
                            total_max[cateid[d.category2.slice(0,3)]] = total_h[cateid[d.category2.slice(0,3)]].values[h].total;
                        }
                    }   
                });

                //create last element in hourly total
                        
                total_h.forEach(function(d){
                    d.values.push({"step":24,"total":d.values[0].total});           
                });

                for (var i=0; i<category.length; i++){
                    if (category[i].id.indexOf("/") !== -1) {
                        category[i].id=category[i].id.replace("/"," / ");               
                    }
                    category[i].x = 70;
                    category[i].y = 80 + 78*i;
                    category[i].type="cate";
                    category[i].radius=R_LARGE;
                }                                     
          }); //end load data
        
        //load data if #journey
        function load_data_usr(){
            $("#sidebar").show();
            if (!data_usr){
                d3.csv("data/traveller.csv.html", function(raw_data){
                
                    data_usr = raw_data;
                    
                    raw_data.forEach(function(d){
                        if(usr.indexOf(d.usr) == -1){
                            usr.push(d.usr);
                        }
                    });
                    
                    usr.forEach(function(d, i){
                        var title;
                        title = d;

                        $("#sidebar").append("<a href='#' class='btn_usr "+d+"'>" + title +"</a>");
                    });
                     
                    map.addLayer(d3layer_journey().data(data_usr));
                });
            }
            
            else map.addLayer(d3layer_journey().data(data_usr)); 
        }

        var update_page = function(){
            var previous_state = state;    
            state = document.location.hash;
            
            switch(state){
                case '':
                    state = '#about';
                case '#about':
                    transition(previous_state,state);
                    break;
                case '#team':
                    transition(previous_state,state);
                    break;
                case '#emerge':
                    transition(previous_state,state);
                    break;
                case '#collide':
                    transition(previous_state,state);
                    break;                    
                case '#stream':
                    transition(previous_state,state);
                    break;
                case '#journey':
                    transition(previous_state,state);
                    break;                    
                default:
                    console.log("no such state " + state);
            }       
        }

        update_page();
        
        $(window).on('hashchange', update_page);

        function transition(prev,cur){
            if(prev == cur)
                return;
            if(prev == '#team' || prev == '#about'){
                if(cur != '#team' && cur != '#about'){
                    fade_out_main(cur);
                    show_viz(cur);
                }
                else {
                    switch_main(cur);
                }
            } else {
                if(cur != '#team' && cur != '#about'){
                    fade_out_viz(prev);
                    show_viz(cur);
                } else {
                    fade_out_viz(prev);
                    show_main(cur);
                }
            }
        }

        function show_viz(cur) {

            STOP = false;
            function create_navigation(){
                $('.lense').each(function(){
                    var top = "-76px"
                    $(this).unbind('mouseenter mouseleave');
                    if ($(this).attr("id").substring(3) == cur.substring(1)) $(this).css("background","#D11D49");
                    else  
                    {
                        $(this).css("background","#000000");
                        $(this).css("top",top);
                    }       
                    var oldColor = $(this).css("background");
                    
                    $(this).hover(
                        function(){
                            $(this).css("background","#D11D49");
                            if ($(this).attr("id").substring(3) !== cur.substring(1)) $(this).animate({"top":"0px"},1000);
                        },  
                        function(){
                            $(this).css("background", oldColor);
                           
                            if ($(this).attr("id").substring(3) !== cur.substring(1)) $(this).animate({"top":top},1000);                   
                        }               
                    ); // end hover
                }); 
            } 
            create_navigation();

            if (cur == "#stream" || cur == "#collide") insertLayer();

            var func = {"#emerge":d3layer_emerge,
                        "#collide":d3layer_collide,
                        "#stream":d3layer_stream,
                        "#journey":d3layer_journey};
            
            /***********************
            *  ADD LAYER
            ************************/
            
            if (cur !== "#journey") {
                l = func[cur]().data(data);
                map.addLayer(l);
            }    
            else  load_data_usr()
                          
        }//end show viz

        function fade_out_viz(prev){
            //clearTimeout(timeoutId);
            STOP = true;
            clearInterval(updTimerId);
            clearInterval(vizTimerId);
            
        for (var j = 0;j<=STEPS;j++){
            
            clearTimeout(Tmout_t[j]);
            clearTimeout(Tmout_d[j]);
            clearTimeout(Tmout_m[j]);

        }
            //category = [];

            $("#time").hide();
            $("#date").hide();
            $("#sidebar").hide();

            $("#map .d3-vec").remove();
            $(".temp").remove();
        }
        
    }); // end map
    
    var main_trans =  [
        {sel:"#img-left", 
         ani:[ {att:"left", t0 :0, t1 : image_width * (-1), dur : 1000}]},
        {sel:"#img-right", 
         ani:[ {att:"left", t0 :0, t1 : image_width, dur : 1000}]},
        {sel:"#overlay", 
         ani:[ {att:"top", t0 :0, t1 : parseInt(overlay_height.substring(0,3)) * (-1) + 64, dur : 1000}]},
        {sel:"#lenses li", 
         ani:[ {att:"padding", t0 :"20px", t1:"8px 8px 4px 8px", dur : 1000},
               {att:"margin-right", t0 :"4px", t1:"4px", dur : 1000},
               {att:"margin-left", t0 :"4px", t1:"4px", dur : 1000}]},
        {sel:"#lenses li img", 
         ani:[ {att:"width", t0 :"100px", t1:"56px", dur : 1000},
               {att:"padding-bottom", t0 :"20px", t1:"10px", dur : 1000}]},
        {sel:"#window-lense", 
         ani:[ {att:"top", t0 :0, t1: -165, dur : 1000},
               {att:"width", t0 :"592px", t1 : "320px", dur : 1000},
               {att:"margin-right", t0 :(window.width-592)/2, t1 : "80px", dur : 1000}]},
        {sel:"#lenses li div", 
         ani:[ {att:"font-size", t0 :"14px", t1: "12px", dur : 1000},
               {att:"width", t0 :"56px", t1 : "56px", dur : 1000},
               {att:"padding", t0 :"4px 8px 4px 8px", t1 : "0 0 0 0", dur : 1000},
               {att:"background-color", t0 :"#000000", t1 : "transparent", dur : 1000}]}
    ];
    //console.log(main_trans);

    function fade_out_main(cur){

        
        var oldSrc = $('#li-'+ cur.substring(1)).find('img').attr('src');
        var newSrc = oldSrc.replace("-hover.svg",".svg");
        
        
        $('#li-'+ cur.substring(1)).find('img').attr('src', newSrc);
        $('#desc').text("");


        for (var a = 0; a < main_trans.length; a++) 
        {
            var animateObj = {};
            for( var b = 0; b < main_trans[a]["ani"].length; b++)
            {
                animateObj[main_trans[a]["ani"][b]["att"]] = main_trans[a]["ani"][b]["t1"];
            }
            
            $(main_trans[a].sel).animate(animateObj, main_trans[a]["ani"][0]["dur"]);     
        }
        
        $('#window-project').fadeOut();
        $('#window-desc').hide();
        $('#middle').css('display','none');
    } // end fade_out_main

    function show_main(cur){
       
        $('#middle').css('display','block');
        
        for (var a = 0; a < main_trans.length; a++) 
        {
            var animateObj = {};
            for( var b = 0; b < main_trans[a]["ani"].length; b++)
                {
                    animateObj[main_trans[a]["ani"][b]["att"]] = main_trans[a]["ani"][b]["t0"];
                }
                
            $(main_trans[a].sel).animate(animateObj, main_trans[a]["ani"][0]["dur"]);     
        }

        
        //$('#window-project p').css('display','none');
        //$(cur).css('display','block');
        switch_main(cur);

        $('.lense').each(function(){
                $(this).unbind('mouseenter mouseleave');
                $(this).css("background-color","transparent");
                $(this).css("top","0px");      
         });

        $('#window-project').css("visibility","hidden");
        $('#window-project').css("display","block");
            reBindhover();
        fade = function(){
            $('#window-project').css("visibility","visible");
        }
        setTimeout(fade,1500);
        $('#window-lense').css("margin-right", "auto"); 
        $('#window-desc').show();   
    }

    function switch_main(cur){

        $('#window-project p').css('display','none');
        $(cur).css('display','block');
    }

}); //end window ready

function parseTime(t){
    var hour = parseInt(t.substring(11,13)),
        minu = parseInt(t.substring(14,16)),
        secd = parseInt(t.substring(17,19));
        return hour * 3600 + minu * 60 + secd;
        //console.log(hour * 3600 + minu * 60 + secd);
}