<!-- INIT -->
var ICDlist = [];
var ATClist = [];

load("ICD","#optionsICD");
load("ATC","#optionsATC");

$.getJSON( ehealthurl+'Demo', function( jsondata ) {
	$("#demo").attr("max",jsondata);
});
<!-- load("ATC","#leftValuesATC"); -->

//writelegend ();


<!-- LOADER -->
function load(loader,form) {
	var myurl=ehealthurl+'Lists'+'?lang='+lang+'&list='+loader;
	
	var myvar='ICDlist';
	var intsort=false;
	if (loader=="ATC") {
		var myvar='ATClist';
		var intsort=false;
	}
	
	$(form).find('option').remove();
	if (window[myvar].length == 0) getfromurl(myurl,myvar,form,intsort);
	else {
		for (i = 0; i < window[myvar].length; i++) {
			$(form).append('<option value=' + window[myvar][i].key + ' title="' + window[myvar][i].value.label + '">' + window[myvar][i].value.label + '</option>');
		}
	}
}

function getfromurl(url,variable,form,intsort) {
	$.getJSON( url, function( jsondata ) {
		var data = $.map(jsondata,function(value,key) { return {"key":key,"value":value};} );
		//console.log(data);
		//data = sortArray(data,intsort);
		/*
		data = data.sort(function (a, b) {
			if (intsort) {
				var c =  parseInt(a.key),
					d = parseInt(b.key);
			} else {
				var c =  a.key,
					d = b.key;
			}
			return (c > d) ? 1 : (d < c) ? -1 : 0;       
		}); */
		//console.log(data);
		for (i = 0; i < data.length; i++) {
			$(form).append('<option value=' + data[i].key + ' title="' + data[i].value.label + '">' + data[i].value.label + '</option>');
		}
		window[variable]=data;
	});
}

<!-- ACTIONS -->

$("#add_ICD").mouseover(function (e) {
	$("#ICDselector").css('top', e.clientY-15);
	$("#ICDselector").css('left', e.clientX-15);
	$("#ICDselector").show();
});

$("#ICDselector").mouseleave(function () {
	$("#ICDselector").hide();
});

$("#add_ATC").mouseover(function (e) {
	$("#ATCselector").css('top', e.clientY -15);
	$("#ATCselector").css('left', e.clientX-15);
	$("#ATCselector").show();
});

$("#ATCselector").mouseleave(function () {
	$("#ATCselector").hide();
});

$("#configure").mouseover(function (e) {
	$("#configurator").css('top', e.clientY-15);
	$("#configurator").css('left', e.clientX-15);
	$("#configurator").show();
});

$("#configurator").mouseleave(function () {
	$("#configurator").hide();
});


$("#searchICD").on('keyup', function() {
	search("#optionsICD",$(this).val(),false);
});

$("#clearSearchICD").click(function () {
	clearsearch("#optionsICD","#searchICD","ICD");
});

$("#optionsICD").change(function () {
	move("#optionsICD","#valuesICD",false);
});


$("#addICD").click(function () {
	move("#optionsICD","#valuesICD",false);
});

$("#valuesICD").change(function () {
	clearitem("#valuesICD");
});

$("#searchATC").on('keyup', function() {
	search("#optionsATC",$(this).val(),false);
});

$("#clearSearchATC").click(function () {
	clearsearch("#optionsATC","#searchATC","ATC");
});

$("#optionsATC").change(function () {
	move("#optionsATC","#valuesATC",false);
});

$("#addATC").click(function () {
	move("#optionsATC","#valuesATC",false);
});

$("#valuesATC").change(function () {
	clearitem("#valuesATC");
});


$("#ALTER").change(function () {
	GO();
});

$("#GESCHLECHT").change(function () {
	GO();
});


$("#import").click(function () {
	$("#demo").val(demo_patient).change();
	//alert("Import of EHR data for patient "+ demo_patient + " successful.");
});

$("#demo").change(function () {
	reset();
	var myurl=ehealthurl+'Demo'+'?patient='+$("#demo").val();
	$.getJSON( myurl, function( jsondata ) {
		$.each(jsondata, function (key, value) {
			if (key == "ICD") {addListToForm(value,"ICDlist","#valuesICD",false);}
			else if (key == "ATC") {addListToForm(value,"ATClist","#valuesATC",false);}
			else $("#"+key).val(value);
		});
		GO();
	});
});

$("#reset").click(function () {
	reset();
});

$('#view_form input').on('change', function() {
  GO(); 
});

$('#mode_form input').on('change', function() {
   drawGraphs(); 
});

<!-- GO  -->
function GO() {
	var postdata = {};
	postdata.view=$('input[name=view]:checked', '#view_form').val();
	postdata.lang=lang;
	postdata.topX=topX;
	postdata.ALTER=$("#ALTER").val();
	postdata.GESCHLECHT=$("#GESCHLECHT").val();
	postdata.ICD=[];
	$("#valuesICD option").each( function() {
		postdata.ICD.push($(this).val());
	});
	postdata.ATC=[];
	$("#valuesATC option").each( function() {
		postdata.ATC.push($(this).val());
	});
	refreshGraph(JSON.stringify(postdata));
}

<!-- Helper Functions -->

function addToForm (item,toForm, intsort) {
	var added = false;
	/*$(item).fadeOut("fast", function() {*/
	if (intsort) {
				var selectint = parseInt($(item).val());
				$(toForm+" option").each(function(){
					if (parseInt($(this).val()) == selectint) {
						added = true;
						return false;
					} else if (parseInt($(this).val()) > selectint) {
						/*$(item).insertBefore($(this)).fadeIn("fast");*/
						$(item).clone().insertBefore($(this));
						added = true;
						return false;
					}
				});
			} else {
						var selectint = $(item).val();
						$(toForm+" option").each(function(){
										if ($(this).val() == selectint) {
											added = true;
											return false;
										} else 
										if ($(this).val() > selectint) {
											/*$(item).insertBefore($(this)).fadeIn("fast");*/
											$(item).clone().insertBefore($(this));
											added = true;
											return false;
										}
						});
					}
			if(!added) {
				$(item).clone().appendTo($(toForm)).fadeIn("fast");
			}
}

function addListToForm (addList,globalVarList,form,intsort) {
	var added = false;
	for (i = 0; i < window[globalVarList].length; i++) {
		if ($.inArray(window[globalVarList][i].key,addList)>-1) {
			var item = '<option value=' + window[globalVarList][i].key + ' title="' + window[globalVarList][i].value.label + '">' + window[globalVarList][i].value.label + '</option>';
			addToForm(item,form,intsort);
			added = true;
		}
	}
}
function move(from,to,intsort) {
	var selectedItem = $(from+" option:selected");
    <!--$("#rightValues").append(selectedItem);-->
    <!-- $("#txtRight").val(selectedItem.text());-->
    //var targetList =$(to+" option");
	$(selectedItem).each(function(){
		var item = $(this);
		addToForm(item,to,intsort);
	});
	GO();
}


function reset() {
	$("#valuesICD").find('option').remove();
	$("#valuesATC").find('option').remove();
	
	clearsearch("#optionsICD","#searchICD","ICD");
	clearsearch("#optionsATC","#searchATC","ATC");
	
	
	d3.selectAll(".chart > *").remove();
	
	//$("#demo").val(0);
	//$("#ALTER").val(40);
}

function clearitem(form) {
	var selectedItem = $(form+" option:selected");
	$(selectedItem).remove();
	GO();
}


function search(searchform,term,intsort) {
	var hiddenform = searchform+"hidden";
	var sterm = term.toLowerCase();
	//var targetList =$(searchform+" option");
	//1st: hide all irrelevant
	$(searchform+" option").each(function(){
				if ($(this).text().toLowerCase().indexOf(sterm) >=0) {
					$(this).prop('selected', true);
				} else {
					$(this).prop('selected', false);
					$(this).appendTo($(hiddenform));
				}
	});
	var hiddenList =$(hiddenform+" option");
	$(hiddenList).each(function(){
				if ($(this).text().toLowerCase().indexOf(sterm) >=0) {
					var added = false;
					var item = $(this);
					if (intsort) {
						var selectint = parseInt($(item).val());
						$(searchform+" option").each(function(){
							if (parseInt($(this).val()) > selectint) {
								$(item).insertBefore($(this));
								added = true;
								return false;
							}
						});
					} else {
						var selectint = $(item).val();
						$(searchform+" option").each(function(){
										if ($(this).val() > selectint) {
											$(item).insertBefore($(this));
											added = true;
											return false;
										}
						});
					}
					if(!added) {
						$(item).appendTo($(searchform));
					}
					//$(this).appendTo($(searchform));
					$(this).prop('selected', true);
					//move(hiddenform,searchform);
				}
	});
}

function clearsearch(searchform,searchinputfield,type) {
	$(searchinputfield).val('');
	var hiddenform = searchform+"hidden";
	
	$(searchform).find('option').remove();
	$(hiddenform).find('option').remove();
	load(type,searchform);
	/*
	//var targetList =$(searchform+" option");
	var hiddenList =$(hiddenform+" option");
	$(hiddenList).each(function(){
			var added = false;
			var item = $(this);
			if (intsort) {
				var selectint = parseInt($(item).val());
				$(searchform+" option").each(function(){
								if (parseInt($(this).val()) > selectint) {
									$(item).insertBefore($(this));
									added = true;
									return false;
								}
				});
			} else {
				var selectint = $(item).val();
				$(searchform+" option").each(function(){
								if ($(this).val() > selectint) {
									$(item).insertBefore($(this));
									added = true;
									return false;
								}
				});
			}
			if(!added) {
				$(item).appendTo($(searchform));
			}
	});
	$(searchform+" option:selected").prop("selected", false)
	*/
}

<!-- Grafik functions -->
	
	var graphdata = null;


function refreshGraph(parameters) {
	d3.select('#theImg').style("visibility","visible");
	d3.json(ehealthurl+'Graph').post(parameters,
	  function (error,jsondata) {
		if (error) return console.warn(error);
		
		graphdata=jsondata;

		drawGraphs();
		
		d3.select('#theImg').style("visibility","hidden");
	});
}

function drawGraphs () {
	
	if (graphdata != null && $('input[name=view]:checked', '#view_form').val() == "LIST") {
		d3.select("#chart_graph").classed("hidden", true);
		d3.select("#charts").classed("hidden", false);
		drawListGraph($('input[name=mode]:checked', '#mode_form').val(),"DIS","#chart_left");
		drawListGraph($('input[name=mode]:checked', '#mode_form').val(),"MED","#chart_right");
	} else if (graphdata != null && $('input[name=view]:checked', '#view_form').val() == "GRAPH") {
		d3.select("#charts").classed("hidden", true);
		d3.select("#chart_graph").classed("hidden", false);
		drawGraph($('input[name=mode]:checked', '#mode_form').val(),"#chart_graph");
	}
}
		
function drawListGraph(type_abs_rel,type_pos,chartid) {
	
	var chart=d3.select(chartid);
	
	chart.selectAll("g").remove();

	var w = $(chartid).width(),
	    h = $(chartid).height(),
	    x = d3.scale.linear().range([0, w]),
	    y = d3.scale.linear().range([0, h]),
		kx_child_faktor = 2; //make last child (=risk) x times wider
		
	//find correct subtree
	var subtree = graphdata;
	for (i=0; i< graphdata.children.length; i++) {
		if (graphdata.children[i].key == type_abs_rel) {
			for (j=0; j< graphdata.children[i].children.length; j++) {
				if (graphdata.children[i].children[j].key == type_pos) {
					subtree=graphdata.children[i].children[j];
					break;
				}
			}
			break;
		}
	}
	//console.log(subtree);

	var partition = d3.layout.partition()
	    .value(function(d) { return type_abs_rel == "ABS" ? d.risk : d.rrisk; })
		.sort(null);

	// d3.json(JSON_FILE, function(root) {
	  var g = chart.selectAll("g")
	      .data(partition.nodes(subtree))
	    .enter().append("svg:g")
	      .attr("transform", function(d) { return d.children ? 
				"translate(" + x(d.y/kx_child_faktor) + "," + y(d.x) + ")"
				: "translate(" + x(d.y/kx_child_faktor) + "," + y(d.x) + ")"; })
		.on("mousemove", mousemoveTooltip)
          .on("mouseout", mouseoutTooltip)
		  .on("click", click_link);

	  var kx = w,
	      ky = h / 1;

	  g.append("svg:rect")
	      .attr("width", function(d) { return d.children ? 
					kx * d.dy / kx_child_faktor :
					kx * d.dy * kx_child_faktor })
	      .attr("height", function(d) { return d.dx * ky; })
	      .attr("class", function(d) { return d.children ? "parent" : "child"; })
		  .attr("fill",function(d) { 
					if (!d.children && !d.isnew) return "#eee";
					if (d.children) {
						if (d.key == "DIS" || d.key == "MED") return "#ddd";
						else return color(d.key);
					} else return color(d.clusterkey);
				});

	  g.append("svg:text")
	      .attr("transform", transform)
	      .attr("width", function(d) { return d.children ? 
					kx * d.dy / kx_child_faktor :
					kx * d.dy * kx_child_faktor })
		  .attr("x", ".35em")
		  .attr("dy", ".1em")
		  .attr("class", function(d) { return d.children ? "parent" : "child"; })
		  /*.attr("fill",function(d) { 
					if (!d.children && !d.isnew) return "#353535";
				})*/
	      .style("opacity", function(d) { return d.dx * ky > 12 ? 1 : 0; })
	      .text(function(d) { return d.children ?  d.label : type_abs_rel == "ABS" ? d.label + ", Risk: " + d.risk : d.label + ", rel. Risk: " + d.rrisk; })
		  .call(wrap);
		  
	 function transform(d) {
	    return "translate(8," + d.dx * ky / 2 + ")";
	  }
			  
}


function drawGraph(type_abs_rel,chartid) {
	
	var chart=d3.select(chartid);
	//chart.selectAll("svg:defs").remove();
	//chart.selectAll("svg:g").remove();

	var width = $(chartid).width(),
	    height = $(chartid).height();
	
	//find correct subtree
	var nodes = {},
		links = {};
	for (i=0; i< graphdata.children.length; i++) {
		if (graphdata.children[i].key == type_abs_rel) {
			for (j=0; j< graphdata.children[i].children.length; j++) {
				if (graphdata.children[i].children[j].key == "LINKS") links=graphdata.children[i].children[j].children;
				if (graphdata.children[i].children[j].key == "NODES") nodes=graphdata.children[i].children[j].children;
			}
			break;
		}
	}
	console.log(links);
	console.log(nodes);
	
	var force = d3.layout.force()
		.nodes(nodes)
		.links(links)
		.size([width, height])
		.linkDistance(60)
		.charge(-300)
		.on("tick", tick)
		.start();
		
	console.log(force.nodes());

	// Set the range
	var  v = d3.scale.linear().range([0, 100]);

	// Scale the range of the data
	v.domain([0, d3.max(links, function(d) { return d.oddsScaled; })]);

	// build the arrow.
	chart.append("svg:defs").selectAll("marker")
		.data(["end"])      // Different link/path types can be defined here
	  .enter().append("svg:marker")    // This section adds in the arrows
		.attr("id", String)
		.attr("viewBox", "0 -5 10 10")
		.attr("refX", 15)
		.attr("refY", -1.5)
		.attr("markerWidth", 6)
		.attr("markerHeight", 6)
		.attr("orient", "auto")
	  .append("svg:path")
		.attr("d", "M0,-5L10,0L0,5");

	// add the links and the arrows
	var path = chart.append("svg:g").selectAll("path")
		.data(force.links())
	  .enter().append("svg:path")
		.attr("class", function(d) { return "link " + d.typekey; })
		.attr("marker-end", "url(#end)");

	// define the nodes
	var node = chart.selectAll(".node")
		.data(force.nodes())
	  .enter().append("g")
		.attr("class", "node")
		.on("click", clickNode)
		.on("dblclick", dblclickNode)
		.call(force.drag);

	// add the nodes
	node.append("circle")
		.attr("r", 5);

	// add the text 
	node.append("text")
		.attr("x", 12)
		.attr("dy", ".35em")
		.text(function(d) { return d.label; });
		
	// add the curvy lines
	function tick() {
		path.attr("d", function(d) {
			var dx = d.target.x - d.source.x,
				dy = d.target.y - d.source.y,
				dr = Math.sqrt(dx * dx + dy * dy);
			return "M" + 
				d.source.x + "," + 
				d.source.y + "A" + 
				dr + "," + dr + " 0 0,1 " + 
				d.target.x + "," + 
				d.target.y;
		});

		node
			.attr("transform", function(d) { 
				return "translate(" + d.x + "," + d.y + ")"; });
	}
}
	
// action to take on mouse click
function clickNode() {
    d3.select(this).select("text").transition()
        .duration(750)
        .attr("x", 22)
        .style("fill", "steelblue")
        .style("stroke", "lightsteelblue")
        .style("stroke-width", ".5px")
        .style("font", "20px sans-serif");
    d3.select(this).select("circle").transition()
        .duration(750)
        .attr("r", 16)
        .style("fill", "lightsteelblue");
}

// action to take on mouse double click
function dblclickNode() {
    d3.select(this).select("circle").transition()
        .duration(750)
        .attr("r", 6)
        .style("fill", "#ccc");
    d3.select(this).select("text").transition()
        .duration(750)
        .attr("x", 12)
        .style("stroke", "none")
        .style("fill", "black")
        .style("stroke", "none")
        .style("font", "10px sans-serif");
}














function wrap(text) {
  text.each(function() {
    var text = d3.select(this),
		width = text.attr("width")-5,
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
 }

  function click_link(d) {
	    if (d.children) return;
		window.open("https://www.clinicalkey.com/#!/search/"+d.label.substr(d.label.indexOf(" ")));
	  }
 //TOOLTIP functions
 	var mousemoveTooltip = function(d) {
	  var xPosition = d3.event.pageX + 5;
	  var yPosition = d3.event.pageY + 5;

	  d3.select("#tooltip")
		.style("left", xPosition + "px")
		.style("top", yPosition + "px");
	 d3.select("#tooltip #t_heading")
			.text(d.label);
	  if (d.children) {
		d3.select("#tooltip #t_absrisk")
			.text(null);
		  d3.select("#tooltip #t_relrisk")
			.text(null);
		  d3.select("#tooltip #t_prev")
			.text(null);
		  d3.select("#tooltip #t_inc")
			.text(null);
		   d3.select("#tooltip #t_mean_age")
			.text(null);
		  d3.select("#tooltip #t_link")
			.text(null);
	  } else {
		  d3.select("#tooltip #t_absrisk")
			.text("Abs. Risk: " +d.risk);
		  d3.select("#tooltip #t_relrisk")
			.text("Rel. Risk: " + d.rrisk);
		  d3.select("#tooltip #t_prev")
			.text("Prevalence: " + d.prevalence);
		  d3.select("#tooltip #t_inc")
			.text("Incidence: " + d.incidence);
		  d3.select("#tooltip #t_mean_age")
			.text("Mean Age: " + d.mean_age);
		  d3.select("#tooltip #t_link")
			.text("-> Click for ClinicalKey Content");
	 }
		  d3.select("#tooltip").classed("hidden", false);
	};

	var mouseoutTooltip = function() {
	  d3.select("#tooltip").classed("hidden", true);
	};


/* my very own sorting function, as jQuery sort is not working in Chrome */
function sortArray(array, intsort) {
	var map = [],
		result = [];

	for (var i=0, length = array.length; i < length; i++) {
	  map.push({
		index: i, // remember the index within the original array
		value: (intsort) ? parseInt(array[i].key) : array[i].key // evaluate the element
	  });
	}

	// sorting the map containing the reduced values
	map.sort(function(a, b) {
	  return a.value > b.value ? 1 : -1;
	});

	// copy values in right order
	for (var i=0, length = map.length; i < length; i++) {
	  result.push(array[map[i].index]);
	}

	 return result;
}