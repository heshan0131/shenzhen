function d3layer_emerge() {

    var f = {}, bounds, feature, collection;
	
	var w_l = 800,
	    h_l = 300;
    var div = d3.select(document.body)
        .append("div")
        .attr('class', 'd3-vec'),
       
        svg = div.append('svg')
        	.attr("id","svg-dot"),
        
		g = svg.append("g");
        /*
        svg_l = div.append('svg')
        	.attr("id","svg-line")
        	.attr("width", w_l)
    		.attr("height", h_l),       
        
        g_l = d3.select('#svg-line').append("g"),
   
	    x = d3.scale.linear().range([0, w_l])
	    	.domain([0,23]),
	    
	    y = d3.scale.linear().range([h_l, 0])
	    	.domain([0,d3.max(total_max)]);	

		var line = d3.svg.line()
		    .interpolate("basis")
		    .x(function(d) { return x(d.step); })
		    .y(function(d) { return y(d.total); });

	    	  */ 
   
    var force = d3.layout.force()
		    .nodes(category)
		    .size([900, 700])
		    .charge(function(d){return (d.type == "cate")? -220 : -2; })
		    .gravity(0.018)
		    .on("tick", tick);

    f.parent = div.node();

    f.project = function(lat, lon) {
      var point = f.map.locationPoint({ lat: lat, lon: lon });
      return [point.x, point.y];
    };

    var first = true;
    f.draw = function() {
      first && svg.attr("width", f.map.dimensions.x)
          .attr("height", f.map.dimensions.y)
          .style("margin-left", "0px")
          .style("margin-top", "0px") && (first = false);

        // here is where things need to be handled according to the geometry
        // type. paths and points would be handled differently
        // I need to understand this in detail
        // geopath = d3.geo.path().projection(layer.project);
        // feature is a d3 selection

        var coords = function(d){ 
            return f.project(d.lat_event, d.lng_event);};
       
        dot.attr('cy', function(d){ return coords(d)[1];})
        	.attr('cx', function(d){ return coords(d)[0];})
       		.attr('r', function(d){ return 2; })
			.attr("class", function(d) {return d.category2.substring(0,3) + " dot hide";})
			.style("fill",function(d) {return colorhex[d.category2.substring(0,3)];});       		
        	//.style("stroke-width",3.5);
      
        ring.attr('cy', function(d){ return coords(d)[1];})
        	 	.attr('cx', function(d){ return coords(d)[0];})
        		.attr('r', function(d){ return 4; })
      			.attr("class", function(d) {return d.category2.substring(0,3) + " ring hide";})       			
        		.style("stroke-width",2)
        		.style("stroke",function(d) {return colorhex[d.category2.substring(0,3)];})
        		.style("fill",function(d) {return colorhex[d.category2.substring(0,3)];});

		image.attr("xlink:href", function(d) {return "image/icon_" + d.id.substring(0,3)+".svg";})
		    .attr("width", 70)
		    .attr("height", 70);
		    		    
		node.call(force.drag)
			.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
		    .on("mousedown", function() { d3.event.stopPropagation(); });	    	
    		  		
    		
    };

    f.data = function(x) {
        collection = x;

        // bounds are [[left, bottom],[right,top]]
        bounds = [
            [
               d3.min(collection, function(d){
                   return d.lat_event; }),
               d3.min(collection, function(d){
                   return d.lng_event; }),
                   ],
            [
               d3.max(collection, function(d){
                  return d.lat_event; }),
               d3.max(collection, function(d){
                   return d.lng_event; }),
                  ]
              ];         
        
        ring = g.selectAll("ring")
            .data(collection)
            .enter().append("circle");
            
        dot = g.selectAll("dot")
            .data(collection)
            .enter().append("circle");
        
		node = svg.selectAll(".node")
		    .data(category.filter(function(d){return d.id !="Others";}))
		  .enter().append("g")
		  	.attr("class","node");
		
		image = node.append("image"); 
			   	       	            
        return f;
    };	
	
    f.extent = function() {
        return new MM.Extent(
            new MM.Location(bounds[0][1], bounds[0][0]),
            new MM.Location(bounds[1][1], bounds[1][0]));
    };
    
    f.copy = function(x) {
    	
    	var coords = function(d){ 
            return f.project(d.lat_event, d.lng_event);};
    	
    	var copy=[];
    	collection.forEach(function(d){
    		if(d.category2 != "Others"){
    			copy.push({"id":d.category2,"cat":cateid[d.category2.slice(0,3)],"tid":d.id,"x":coords(d)[0],"y":coords(d)[1],"type":"point","radius":R_SMALL});
    		}    		
    	});
    	return copy;
    	//console.log(copy);
    }
       
    
    ///////////////////////////////////////
    //
    //   This here start dot animation
    //
    ///////////////////////////////////////

    vizTimerId = 0;
    updTimerId = 0;

    setTimeout(showDots, VIZ_DELAY);

    //setTimeout(collide,1000+60*60*24*SPE_DOT);
    vizTimerId = setInterval(showDots,60*60*24*SPE_DOT);

    setTimeout(upd_em,VIZ_DELAY);
        
    updTimerId = setInterval(upd_em,60*60*24*SPE_DOT);
		
	function tick(e) {

	  // Push different nodes in different directions for clustering.	  
	  var k = 0.08 * e.alpha;
	  
	  category.forEach(function(o, i) {
	  
	  	var mul,shift;
	  	mul = (o.type == "cate")? 4 : 1;
	  	shift = (o.type == "cate")? -100 : 100;
	  	
	    o.y += (focus[o.cat].y - o.y)*k*mul;
	    o.x += (focus[o.cat].x - o.x)*k*mul;
	  });
	
	  node.attr("transform", function(d) { return "translate(" + (d.x - d.radius) + "," + (d.y - d.radius) + ")"; });	  
	  //node.attr("x", function(d) { return d.x; })
	    //  .attr("y", function(d) { return d.y; });
	      
	}
		
	function showDots(){

		var t0 = svg.selectAll(".dot")
			.transition()
			.delay(function(d){return parseTime(d.created_time)*SPE_DOT;})
			.duration(500)
			.style("opacity", 1)
			.attr("class", function(d) {return d.category2.substring(0,3) + " dot show";});	
				
		var t1 = svg.selectAll(".ring")
			.transition()
			.delay(function(d){return parseTime(d.created_time)*SPE_DOT;})
			.duration(3000)
			.attr('r', 14)
			.style("opacity", 0.4)
			.style("stroke-width",1)
			.attr("class", function(d) {return d.category2.substring(0,3) + " ring show";});			
	
		var t2 = svg.selectAll(".ring")
			.transition()
			.delay(function(d){return parseTime(d.created_time)*SPE_DOT +3000;})
			.duration(2000)
			.attr('r', 2)
			.style("opacity", 0);
			
		var t3 = svg.selectAll(".dot")
			.transition()
			.delay(function(d){return parseTime(d.created_time)*SPE_DOT +1000;})
			.duration(2500)
			.style("opacity", 0);
							
	}
	
	function collide(){	
		$("#time").hide();
		//$("#svg-line").hide();
		//stop dots animation
		//clearInterval(timerId);
		
		var t2 = svg.selectAll(".ring")
			.transition()			
			.duration(0)
			.attr('r', 2)
			.style("opacity", 0);
			
		var t3 = svg.selectAll(".dot")
			.transition()			
			.duration(0)
			.style("opacity", 0);
		
		// for layout
		var result = f.copy();
		category = category.concat(result);
		//console.log(category);
		force.nodes(category);
		node = node.data(force.nodes());
		//console.log(force.nodes());
		node.enter().append("g")
		  	.attr("class","node")
		  	.attr("transform", function(d) { return "translate(" + (d.x - d.radius) + "," + (d.y-d.radius) + ")"; })
			.append("circle")
				.style("opacity",0)
				.attr("class",function(d) {return d.id.substring(0,3) + " button";})
				.attr("r", function(d) {return d.radius;});
		var t = svg.selectAll(".button")
			.transition()
			.duration(1000)
			.style("opacity",1);		
  		
  		node.exit().remove();

		setTimeout(force.start,2000);
				
	}		
    return f;    
}

function upd_em() {
		//console.log("vizTimerId = " + vizTimerId);
        //console.log("updTimerId = " + updTimerId);

		$("#time").show();
		$("#date").show();

        for (var j = 0;j<=STEPS;j++){
           
            	update_time_em(j);            
        }
}

String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second parm
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);
	var apm = (hours<12)? "AM":"PM";
    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time    = hours+':'+minutes+apm;
    return time;
}
	
function update_time_em(j){
	
	$("#date").text("Friday, Nov 8th 2013");
    var seconds_steps = 24*60*60/STEPS;
    Tmout_m[j] = setTimeout(function(){$("#time").text(String(j*seconds_steps).toHHMMSS());},j*SPEED); 
}

function update_step(i) {

   $("#slider").slider({ value: i });
    
}	
