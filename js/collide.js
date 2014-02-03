function d3layer_collide() {

    var f = {}, bounds, feature, collection;
    //make a copy of category
    var nodes = $.extend(true, [], category);
    console.log(nodes);	
	/*
	var w_l = 800,
	    h_l = 300;*/
    var div = d3.select(document.body)
        .append("div")
        .attr('class', 'd3-vec'),
       
        svg = div.append('svg')
        	.attr("id","svg-dot"),
        g = svg.append("g");
        
    var force = d3.layout.force()
		    .nodes(nodes)
		    .size([900, 700])
		    .charge(function(d){return (d.type == "cate")? -220 : -2; })
		    .gravity(0.018)
		    .on("tick", tick);
		    //.start();

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
       

       /*
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
*/
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
       /* 
        ring = g.selectAll("ring")
            .data(collection)
            .enter().append("circle");
            
        dot = g.selectAll("dot")
            .data(collection)
            .enter().append("circle");
        */
		node = svg.selectAll(".node")
		    .data(nodes.filter(function(d){return d.id !="Others";}))
		  .enter().append("g")
		  	.attr("class","node");
		
		image = node.append("image"); 
		/*
		path = g_l.selectAll('path')
			.data(total_h)
			.enter().append("path")
			.attr("class", function(d){return d.cate + " path";})
			.attr("stroke-width", 2);
		*/	
        
        	       	            
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
    
    //var timerId = 0
    //setTimeout(showDots, 1000);
    setTimeout(collide,1000);
    //timerId = setInterval(showDots,60*60*24*SPE_DOT);
		
	function tick(e) {

	  // Push different nodes in different directions for clustering.	  
	  var k = 0.08 * e.alpha;
	  
	  nodes.forEach(function(o, i) {
	  
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
	/*	
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
	
	function draw(k) {
		      
	      path.attr("d", function(d) { return line(d.values.slice(0, k + 1)); })
	      	.style("stroke", function(d) { return colorhex[d.cate];});   

	}
	
	
	//setTimeout(drawLine,1000);
	
	function drawLine(){
		var k = 1, n = 24;
		for (k = 1; k < n-1; k++){
			setTimeout(draw(k),60*60*SPE_DOT);
	    
	    }

	} 
	  */

	
	//$('#force').click(function(){
	function collide(){	
		$("#time").hide();
		$("#svg-line").hide();
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
		nodes = nodes.concat(result);

		console.log(category);
		force.nodes(nodes);
		
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
			.delay(function(d,i){return i*0.5;})
			.duration(1500)
			.style("opacity",1);		
  		
  		node.exit().remove();

		setTimeout(force.start,3000);
				
	}
    return f;
}