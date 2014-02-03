function d3layer_journey() {
	
    var f = {}, bounds, feature, collection;
    var colorhex = {
			"USER1": "#A92B4D",
			"USER2": "#3867B1",
			"USER3": "#2B7A3C",
			"USER4": "#DF6235",
			"USER5": "#F2B71A",
			"USER6": "#9ACA45",
			"USER7": "#E34A51",
			"USER8": "#83CBF1",
			"USER9": "#f89b1c",
			"USER10": "#f8ef1b",
			"USER11": "#c9464b",
			"USER12": "#4ab848",
			"USER13": "#7d3c32",
			"USER14": "#a33f57",
			"USER15": "#d02a27",
			"USER16": "#6ecff6",
			"USER17": "#0c4e9f",
			"USER18": "#f04d50",
			"OTHER": "none"
		};

   var div = d3.select(document.body)
        .append("div")
        .attr('class', 'd3-vec'),
        svg = div.append('svg')
        	.attr("id","svg-clear"),
        g = svg.append("g");
        
    f.parent = div.node();
    
    var coords = function(d){
        var point = f.map.locationPoint({ lat: d.lat_event, lon: d.lng_event });
        var point2 = f.map.locationPoint({ lat: d.lat_event2, lon: d.lng_event2 });
        return [point.x, point.y, point2.x, point2.y];
        };
        
	var getLength = function(d){
	    var point = f.map.locationPoint({ lat: d.lat_event, lon: d.lng_event });
        var point2 = f.map.locationPoint({ lat: d.lat_event2, lon: d.lng_event2 });
	    return Math.sqrt(Math.pow(point.x-point2.x, 2)+Math.pow(point.y-point2.y, 2));
	}
        
	function parseTime(t){
		var date = parseInt(t.substring(8,10)),
		    hour = parseInt(t.substring(11,13)),
			minu = parseInt(t.substring(14,16)),
			secd = parseInt(t.substring(17,19));
			return (date - 4) * 86400+hour * 3600 + minu * 60 + secd;
	}
	    
    var first = true;
    f.draw = function() {
        first && svg.attr("width", f.map.dimensions.x)
          .attr("height", f.map.dimensions.y)
          .style("margin-left", "0px")
          .style("margin-top", "0px")&& (first=false);
        
        ring.attr('cy', function(d){ return coords(d)[1];})
                .attr('cx', function(d){ return coords(d)[0];})
                .attr('r', function(d){ return 4; })
                .attr("class", function(d) {return "ring " + d.usr;})
                .style("stroke",function(d) {return colorhex[d.usr];})
                .style("fill","none")
                .style("opacity", 0);
        
        dot.attr('cy', function(d){ return coords(d)[1];})
                .attr('cx', function(d){ return coords(d)[0];})
                .attr('r', function(d){ return 4; })
                .attr("class", function(d) {return "dot " + d.usr;})
                .style("fill",function(d) {return colorhex[d.usr];})
                .style("stroke", "none")
                .style("opacity", 0);
        
        trip.attr("d", function(d){return "M "+coords(d)[0]+" "+coords(d)[1]+" L "+coords(d)[2]+" "+coords(d)[3];})
                .attr("class", function(d){return "trip " + d.usr;})
                .attr("stroke-dasharray", function(d){return getLength(d)+" , "+getLength(d);})
                .attr("stroke-dashoffset", function(d){return getLength(d);})
                .style("stroke",function(d) {return colorhex[d.usr];})
                .style("stroke-width", 3)
                .style("opacity", 0);
                
    };
            
    f.parent = div.node();

    f.data = function(x) {
        collection = x;
        bounds = [[d3.min(collection, function(d){return d.lat_event; }),
                            d3.min(collection, function(d){return d.lng_event; }),],
                         [d3.max(collection, function(d){return d.lat_event; }),
                            d3.max(collection, function(d){return d.lng_event; }),]];
        trip = g.selectAll("trip").data(collection).enter().append("path");
        ring = g.selectAll("circle").data(collection).enter().append("circle");
        dot = g.selectAll("dot").data(collection).enter().append("circle");
        return f;
    };
    
    
    vizTimerId = 0;
    updTimerId = 0;
    setTimeout(showAlls, VIZ_DELAY);
    vizTimerId = setInterval(showAlls, 60*60*24*7*SPE_TRIP);

    setTimeout(upd_usr,VIZ_DELAY);
    updTimerId = setInterval(upd_usr,60*60*24*SPE_DOT);
    
    function showAlls(){

        var path_t1 = svg.selectAll(".trip")
                .transition()
                .delay(function(d){return parseTime(d.created_time)*SPE_TRIP;})//should be 0.1
                .duration(function(d){return d.duration*SPE_TRIP;})
                .style("stroke-width", 3)
                .style("opacity", 100)
                .ease("basis")
                .attr("stroke-dashoffset", 0);
         
        var path_t2 = svg.selectAll(".trip")
                    .transition()
			        .delay(function(d){return parseTime(d.created_time)*SPE_TRIP+d.duration*SPE_TRIP;})               
			        .duration(0)
                    .ease("basis")
                    .attr("stroke-dashoffset", function(d){return getLength(d)*2;})
                    .style("stroke-width", 1)
                    .style("opacity", 0.9);
        
        var path_t3 = svg.selectAll(".trip")
                    .transition()
                    .delay(60*60*24*7*SPE_TRIP)
                    .duration(0)
                    .attr("stroke-dasharray", function(d){return getLength(d)+" , "+getLength(d);})
                    .attr("stroke-dashoffset", function(d){return getLength(d);})
                    .style("stroke-width", 3)
                    .style("opacity", 0);
                    
        var ring_t1 = svg.selectAll(".ring")
                        .transition()
    			        .delay(function(d){return parseTime(d.created_time)*SPE_TRIP-d.duration_last*SPE_TRIP*0.5;})
    			        .duration(function(d){return d.duration_last*SPE_TRIP*0.5;})
    			        .attr("r", 6)
    			        .style("stroke-width", 2)
    			        .style("opacity", 100);
    			        
    	var ring_t2 = svg.selectAll(".ring")
                        .transition()
    			        .delay(function(d){return parseTime(d.created_time)*SPE_TRIP;})
    			        .duration(function(d){return d.duration*SPE_TRIP*0.5;})
    			        .attr("r", 14)
    			        .style("stroke-width", 1)
    			        .style("opacity", 0);
    			        
    	var ring_t3 = svg.selectAll(".ring")
    	                .transition()
    	                .delay(60*60*24*7*SPE_TRIP)
    	                .duration(0)
    	                .attr('r', function(d){ return 4; })
    	                .style("opacity",0);
    			        
    	var dot_t1 = svg.selectAll(".dot")
    	                .transition()
    	                .delay(function(d){return parseTime(d.created_time)*SPE_TRIP;})
    	                .duration(0)
    	                .style("stroke-width", 3)
    	                .style("opacity", 0.8);
    	                
    	var dot_t2 = svg.selectAll(".dot")
    	                .transition()
    	                .delay(60*60*24*7*SPE_TRIP)
    	                .duration(0)
    	                .style("opacity",0);
        }
    
    return f; 
};

function upd_usr() {

        console.log("vizTimerId = " + vizTimerId);
        console.log("updTimerId = " + updTimerId);
        $("#time").show();
        $("#date").show();

        for (var j = 0;j<=STEPS;j++){
            
                update_time_usr(j);            
        }
}

function update_time_usr(j){
    var seconds_steps = 24*60*60*7/STEPS;
    var timer = $("#time");
    var date = $("#date");
    Tmout_t[j] = setTimeout(function(){timer.text(String((j*seconds_steps)%86400).toHHMMSS());}, j*SPEED);
    Tmout_d[j] = setTimeout(function(){date.text(day[parseInt((j*seconds_steps)/86400)]+" Nov " + String(parseInt((j*seconds_steps)/86400)+4)+"th 2013");}, j*SPEED) ;
}


