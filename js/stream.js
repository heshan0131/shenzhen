function d3layer_stream() {

    var margin = {top: 20, right: 50, bottom: 30, left: 50};
    var f = {}, bounds, feature, collection;
	
	var w_l = 1000,
	    h_l = 370;
    var div = d3.select(document.body)
        .append("div")
        .attr('class', 'd3-vec'),
       
        svg = div.append('svg')
        	.attr("id","svg-dot"),
        
        svg_l = div.append('svg')
        	.attr("id","svg-line")
        	.attr("width", w_l + margin.right + margin.left)
    		.attr("height", h_l + margin.top + margin.bottom),
    		
	
        g = svg.append("g"),
        
        g_l = d3.select('#svg-line').append("g")
        	.attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
   
	    x = d3.scale.linear().range([0, w_l])
	    	.domain([0,total_h[0].values.length-1]),
	    
	    y = d3.scale.linear().range([h_l, 0])
	    	.domain([0,d3.max(total_max)]),
	    	
		yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("left")
	    //.outerTickSize(0)
	    .tickPadding(6),
	    	    
	    xAxis = d3.svg.axis()
	    .scale(x)
	    .orient("bottom")
	    //.outerTickSize(0)
	    .tickPadding(6);
  
    var force = d3.layout.force()
		    .nodes(category)
		    .size([900, 700])
		    .charge(function(d){return (d.type == "cate")? -220 : -2; })
		    .gravity(0.018);
		    
		    //.start();

	// A line generator, for the dark stroke.
	var line = d3.svg.line()
	    .interpolate("linear")
	    .x(function(d) { return x(d.step); })
	    .y(function(d) { return y(d.total); });
	    
   	var area = d3.svg.area()
		.interpolate("linear")   
	    .x(function(d) { return x(d.step); })
	    .y0(function(d) { return y(0); })
	    .y1(function(d) { return y(d.total); });
   /*
    var xAxis = d3.svg.axis()
                  .scale(xScale)
                  .orient("bottom");
                  */

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

		image.attr("xlink:href", function(d) {return "image/icon_" + d.id.substring(0,3)+".svg";})
		    .attr("width", 70)
		    .attr("height", 70);
		    		    
		node.call(force.drag)
			.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
		    .on("mousedown", function() { d3.event.stopPropagation(); });	    	
    		  		
    	yaxis.call(yAxis);
    	
    	xaxis.call(xAxis);
		
		for (var t = 0; t < 5; t++) {		
		xaxis.append("rect")		      		      
		      
		      .attr("y",-2)
		      .attr("x",x(t*6)-25)		      
		      .attr("width",50)
		      .attr("height",18)
		      .style("fill","#212121");
				
		xaxis.append("text")		      		      
		      .style("text-anchor", "middle")
		      .attr("y",12)
		      .attr("x",x(t*6))		      
		      .attr("class","tickTime")
		      .style("fill","#ffffff")
		      .text(t%4<2? t%4*6 + "AM" : t%4*6+"PM");
		}		      	
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
                
		node = svg.selectAll(".node")
		    .data(category.filter(function(d){return d.id !="Others";}))
		  .enter().append("g")
		  	.attr("class","node")

		
		image = node.append("image"); 
		
		path = g_l.selectAll('path')
			.data(total_h)
			.enter().append("path")
			.attr("class", function(d){return d.cate + " path";})
			.attr("stroke-width", 2);
			
        yaxis = d3.select('#svg-line').append("g")
		      .attr("class", "y axis")
		      .attr("transform", "translate(" + (margin.left-20) + "," + margin.top + ")");
		     
       	xaxis = d3.select('#svg-line').append("g")
		      .attr("class", "x axis")
		      .attr("transform", "translate(" + margin.left + "," + (margin.top + h_l +10)+ ")"); 
               	       	            
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
    
		
	setTimeout(drawLine,1000);
	
	function draw(k) {
		      
	      path.attr("d", function(d) { return line(d.values.slice(0, k + 1)); })
	      	.style("stroke", function(d) { return colorhex[d.cate];});
	      	//.style("opacity", 0.7);
	}
		
	function drawLine(){
		var k = 1, n = 24;
		
		
		//setTimeout(drawSeg,100);
		//setInterval(drawSeg,50);
		//function drawSeg(){
		d3.timer(function() {
		    //setTimeout(draw(k),100);
		    draw(k);
		    if ((k += 2) >= n - 1) {
		      draw(n - 1);
		      setTimeout(drawArea, 500);
		      return true;
		    }
		    
		});
	} 
	  
	function compare_total(a, b) {
		  if (a.total > b.total)
		     return -1;
		  if (a.total < b.total)
		     return 1;
		  // a must be equal to b
		  return 0;
	}
	
	function sortItems (a, b) {  
	            return total_c[cateid[b.cate]] - total_c[cateid[a.cate]];	 
	};
	
	function drawArea(){
		 
		var duration = 1000,
			delay = 300,
			cycle = duration * 2 + delay; // delay between showtop amd hidetop

		g_l.selectAll('path').remove();
		svg.selectAll('.node')
			.style("opacity",0.2);
		
		
		
		var total_c_sort = [];
		
		total_c.forEach(function(d,i){
			
			total_c_sort.push({ id : i, total : d});			
			
		});
				 
		total_c_sort.sort(compare_total);
		//console.log(total_c_sort);
		
		var permutation = {};
		for(var i = 0; i<total_c_sort.length;i++){
			permutation[total_c_sort[i].id] = i;
		}
		console.log(permutation);
		
					
		var areas_bottom = g_l.selectAll('area')
			.data(total_h)
			.enter().append("path")
			.attr("class", function(d){return d.cate + " areabottom";})
			.attr("d", function(d) {return area(d.values);})
	      	.style("fill", function(d) { return colorhex[d.cate];})
	      	.style("opacity", 0)
	      	.sort(sortItems);


		area.y1(function(d) { return y(0); });  	


		var areas_top = g_l.selectAll('.areatop')
			.data(total_h)
			.enter().append("path")
			.attr("class", function(d){return d.cate + " areatop";})
			.attr("d", function(d) {return area(d.values);})
	      	.style("fill", function(d) { return colorhex[d.cate];})
	      	.style("opacity", 0)
	      	.sort(sortItems);
				
	    area.y1(function(d) { return y(d.total); });  	

		var t_showtop = g_l.selectAll('.areatop')
			.transition()
			.duration(duration)
			//.delay(function(d,i){ var id = cateid[d.cate]; return (total_c.length - 1 - permutation[id]) * 1000;})
			.delay(function(d,i){return (total_c.length-1-i)*cycle;})
			.attr("d", function(d) {return area(d.values);})
			.style("opacity",1);

		var t_shownode = svg.selectAll('.node')
			.transition(0)
			.duration(duration)
			.delay(function(d,i){ return (total_c.length - 1 - permutation[d.cat]) * cycle;})
			.style("opacity",1);	
		

		var t_hidetop = g_l.selectAll('.areatop')
			.transition()
			.duration(duration)
			//.delay(function(d,i){ var id = cateid[d.cate]; return (total_c.length - 1 - permutation[id]) * 1000;})
			.delay(function(d,i){return (total_c.length-1-i)*cycle + duration + delay;})
			.attr("d", function(d) {return area(d.values);})
			.style("opacity",0)
			.remove();
		

		var t_showbottom = g_l.selectAll('.areabottom')
			.transition()
			.duration(duration)
			//.delay(function(d,i){ var id = cateid[d.cate]; return (total_c.length - 1 - permutation[id]) * 1000;})
			.delay(function(d,i){return (total_c.length-1-i)*cycle + duration + delay;})			
			.style("opacity",0.8);

		function addMouseevent(){

			g_l.selectAll('.areabottom')
				.on("mouseover", function() {

					var id = d3.select(this).attr("class").substring(0,3);
					d3.selectAll('.areabottom')
						.transition()
						.duration(250)
						.style("opacity",0.1);	


					d3.selectAll('.node') 
						//.filter(function(d) {return d.cat !== cateid[this.cate];})
						.transition()
						.duration(250)
						.style("opacity",0.1);	
					

					d3.select(this)
						.transition()
						.duration(250)
						.style("opacity",1);

					d3.selectAll('.node')
						.filter(function(d) {return d.cat == cateid[id];})
						.transition()
						.duration(250)
						.style("opacity",1);			

				})
				.on("mouseout", function() {

					d3.selectAll('.areabottom')					
						.transition()
						.duration(250)
						.style("opacity",0.8);

					d3.selectAll('.node') 
						.transition()
						.duration(250)
						.style("opacity",1);	
										
				});

		}
		setTimeout(addMouseevent,cycle*total_c.length);						
	}		
    return f;    
}