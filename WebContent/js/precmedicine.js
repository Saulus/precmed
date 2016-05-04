<!-- INIT -->

//filter init
var prevalence_min=0, prevalence_max=15;


var ICDlist = [];
var ATClist = [];

var graphdata = null;
	var graphnodes = {},
	graphlinks = {},
	nodes = {},
	links = {},
	nodeClickInProgress=false;
var listtree = null;
	
var filtercriteria = {}; //single Criteria: variable: "nodevar", min: 0, max: 100
	

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

<!-- UI -->
  $(function() {
    $( "#prevslider" ).slider({
      range: true,
      min: prevalence_min,
      max: prevalence_max,
      values: [ 0, 15 ],
      slide: function( event, ui ) {
		  if (ui.values[ 1 ]>=$( "#prevslider" ).slider( "option", "max" )) 
			$( "#prevalence" ).val( ui.values[ 0 ] + "% - MAX" );
		  else $( "#prevalence" ).val( ui.values[ 0 ] + "% - " + ui.values[ 1 ]+ "%" );
      },
	  stop: function( event, ui ) {
		  drawGraphs(); 
	  }
    });
	if ($( "#prevslider" ).slider( "values", 1 )>=$( "#prevslider" ).slider( "option", "max" )) 
		$( "#prevalence" ).val( $( "#prevslider" ).slider( "values", 0 ) +      "% - MAX" );
	else 
		$( "#prevalence" ).val( $( "#prevslider" ).slider( "values", 0 ) +      "% - " + $( "#prevslider" ).slider( "values", 1 )+ "%" );
	
	$( "#thresholdslider" ).slider({
      min: 0,
      max: 100,
      value: 0,
      slide: function( event, ui ) {
		  $( "#threshold" ).val(">= " + ui.value + "%");
      },
	  stop: function( event, ui ) {
		  drawGraphs(); 
	  }
    });
	$( "#threshold" ).val(">= " + $( "#thresholdslider" ).slider( "value")+ "%");
	
	
	$( "#tabs" ).tabs({
		active: 0,
		activate: function( event, ui ) {
			drawGraphs(); 
		}
	});
	
	$('#shownodeoverview').prop('checked', false);
  });
  

  
<!-- ACTIONS -->

$("#add_ICD").mouseover(function (e) {
	$("#ICDselector").css('top', e.clientY-15);
	$("#ICDselector").css('left', e.clientX-75);
	$("#ICDselector").show();
});

$("#ICDselector").mouseleave(function () {
	$("#ICDselector").hide();
});

$("#ICDselectorX").click(function () {
	$("#ICDselector").hide();
});

$("#add_ATC").mouseover(function (e) {
	$("#ATCselector").css('top', e.clientY -15);
	$("#ATCselector").css('left', e.clientX-175);
	$("#ATCselector").show();
});

$("#ATCselector").mouseleave(function () {
	$("#ATCselector").hide();
});

$("#ATCselectorX").click(function () {
	$("#ATCselector").hide();
});

$("#configure").mouseover(function (e) {
	$("#configurator").css('top', e.clientY-15);
	$("#configurator").css('left', e.clientX-$("#configurator").width()+50);
	$("#configurator").show();
});

$("#configurator").mouseleave(function () {
	$("#configurator").hide();
});

$("#configuratorX").click(function () {
	$("#configurator").hide();
});

$("#legend").mouseover(function (e) {
	$("#thelegend").css('top', e.clientY-$("#configurator").height()-15);
	$("#thelegend").css('left', e.clientX-$("#thelegend").width()+15);
	$("#thelegend").show();
});


$("#thelegend").mouseleave(function () {
	$("#thelegend").hide();
});

$("#thelegendX").click(function () {
	$("#thelegend").hide();
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


$("#AGE").change(function () {
	GO();
});

$("#GENDER").change(function () {
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


$("#resetView").click(function () {
	resetFilter();
	selectNodesAndLinks($('input[name=mode]:checked', '#mode_form').val());
	drawGraphs();
});

$('#view_form input').on('change', function() {
  GO(); 
});



$('#mode_form input').on('change', function() {
   selectNodesAndLinks($('input[name=mode]:checked', '#mode_form').val());
   drawGraphs(); 
});

$('#searchNode').on('keyup', function() {
	$('#searchNodeLabel').val($(this).val());
	drawGraphs(); 
});
$('#searchNodeLabel').on('keyup', function() {
	$('#searchNode').val($(this).val());
	drawGraphs(); 
});


$("#clearSearchNode").click(function () {
	$('#searchNode').val('');
	$('#searchNodeLabel').val('');
	drawGraphs(); 
});

$("#clearSearchNodeLabel").click(function () {
	$('#searchNode').val('');
	$('#searchNodeLabel').val('');
	drawGraphs(); 
});


$("input[name=nodetypes]:checkbox").change(function () {
	drawGraphs(); 
});

$('#shownodeoverview').change(function() {
	 $( "#nodeoverview" ).toggle( "slide" );
});

$('#nodeoverviewX').click(function () {
	$('#shownodeoverview').prop( "checked", false );
	$( "#nodeoverview" ).toggle( "slide" );
});





// Click on node: select
function focusNode(d) {
	d.isCurrentlyFocused = !d.isCurrentlyFocused;
	$('#searchNode').val('');
	$('#searchNodeLabel').val('');
	drawGraphs();
}

function hideNode(d) {
	d.hideNode = true;
	d3.select("#tooltip").classed("hidden", true);
	drawGraphs();
}



<!-- GO  -->
function GO() {
	var postdata = {};
	postdata.view=$('input[name=view]:checked', '#view_form').val();
	postdata.lang=lang;
	postdata.topX=$('input[name=topX]:checked', '#view_form').val();
	postdata.AGE=$("#AGE").val();
	postdata.GENDER=$("#GENDER").val();
	postdata.ICD=[];
	$("#valuesICD option").each( function() {
		postdata.ICD.push($(this).val());
	});
	postdata.COUNT_ICD = postdata.ICD.length;
	postdata.ATC=[];
	$("#valuesATC option").each( function() {
		postdata.ATC.push($(this).val());
	});
	postdata.COUNT_ATC = postdata.ATC.length;
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
	
	resetFilter();
	
	graphdata=null;
	
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


function refreshGraph(parameters) {
	d3.select('#theImg').style("visibility","visible");
	d3.json(ehealthurl+'Graph').post(parameters,
	  function (error,jsondata) {
		if (error) return console.warn(error);
		
		graphdata=jsondata;

		selectNodesAndLinks($('input[name=mode]:checked', '#mode_form').val());
		drawGraphs();
		d3.select('#theImg').style("visibility","hidden");
	});
}

function selectNodesAndLinks(type_abs_rel) {
	if (graphdata==null) { GO(); return; }
	
	//LIST or GRAPH
	for (lg=0; lg< graphdata.children.length; lg++) {
		if (graphdata.children[lg].key == "LIST") {
			//find correct subtree
			listtree = graphdata.children[lg];
			for (i=0; i< graphdata.children[lg].children.length; i++) {
				if (graphdata.children[lg].children[i].key == type_abs_rel) {
					listtree=graphdata.children[lg].children[i].children;
					break;
				}
			}
			
		} else if (graphdata.children[lg].key == "GRAPH") {
			//find correct subtree
			for (i=0; i< graphdata.children[lg].children.length; i++) {
				if (graphdata.children[lg].children[i].key == type_abs_rel) {
					for (j=0; j< graphdata.children[lg].children[i].children.length; j++) {
						if (graphdata.children[lg].children[i].children[j].key == "LINKS") graphlinks=graphdata.children[lg].children[i].children[j].children;
						if (graphdata.children[lg].children[i].children[j].key == "NODES") graphnodes=graphdata.children[lg].children[i].children[j].children;
					}
					break;
				}
			}	
			//init Nodes:
			//isCurrentlyFocused and hideNode and fixed and position
			var n = graphnodes.length,
				width= $("#thegraph").width();
				height= $("#thegraph").height()
			for (k=0; k< n; k++) {
				graphnodes[k].isCurrentlyFocused=false;		
				graphnodes[k].hideNode=false;
				graphnodes[k].fixed = false;
				graphnodes[k].x = Math.cos((graphnodes[k].clusterkey+1) / (numberClusters+1) * 2 * Math.PI) * 200 + width / 2 + Math.random();
				graphnodes[k].y = Math.sin((graphnodes[k].clusterkey+1) / (numberClusters+1) * 2 * Math.PI) * 200 + height / 2 + Math.random();
				
				//graphnodes[k].x = graphnodes[k].y = width / n * k;
			}
			
			//init radius for prevalence
			//v = d3.scale.linear().range([nodeminradius, nodemaxradius]);
			//v.domain([0, 25]);
			/*
			graphnodes.forEach(function(node) {
				if (node.typekey=="GEN") node.radius = nodeminradius;
				//else node.radius = v(node.prevalence*100);
				else node.radius = nodeminradius;
			});*/
			
			//Init Links
			//...assign node objects to links (instead of array pos)
			//...init scale for opacity
			//..init linkStrength
			// Set the range
			var  v = d3.scale.linear().range([0, 100]);
			// Scale the range of the data
			v.domain([0, d3.max(graphlinks, function(d) { return d.oddstransformed; })]);
			
			for (i=0; i< graphlinks.length; i++) {
					if (graphlinks[i].source.key) break; //objects already assigned
					sourceNo = graphlinks[i].source;
					targetNo = graphlinks[i].target;
					graphlinks[i].source = graphnodes[sourceNo];
					graphlinks[i].target = graphnodes[targetNo];
					// assign a opaType and directionType per value to encode opacity
					if (v(graphlinks[i].oddstransformed) <= 25) {
						graphlinks[i].opaType = "twofive";
						graphlinks[i].linkStrength = 0.25;
					} else if (v(graphlinks[i].oddstransformed) <= 50 && v(graphlinks[i].oddstransformed) > 25) {
						graphlinks[i].opaType = "fivezero";
						graphlinks[i].linkStrength = 0.5;
					} else if (v(graphlinks[i].oddstransformed) <= 75 && v(graphlinks[i].oddstransformed) > 50) {
						graphlinks[i].opaType = "sevenfive";
						graphlinks[i].linkStrength = 0.75;
					} else if (v(graphlinks[i].oddstransformed) <= 100 && v(graphlinks[i].oddstransformed) > 75) {
						graphlinks[i].opaType = "onezerozero";
						graphlinks[i].linkStrength = 1;
					}
					if (graphlinks[i].odds<1) graphlinks[i].directionType = "lowers";
					else graphlinks[i].directionType = "increases";
			}
			
			
			nodes=graphnodes;
			links=graphlinks;
		}
	}
}

function drawGraphs () {
	//console.log("Draw");
	filterChanger();
	var active = $( "#tabs" ).tabs( "option", "active" );
	
	if (graphdata != null && active == 0) {
		//d3.select("#thegraph").selectAll("*").remove();
		$("#chart_graph").hide();
		$("#charts").show();
		drawListGraph($('input[name=mode]:checked', '#mode_form').val(),"DIS","#chart_left");
		drawListGraph($('input[name=mode]:checked', '#mode_form').val(),"MED","#chart_right");
	} else if (graphdata != null && active == 1) {
		$("#charts").hide();
		$("#chart_graph").show();
		//d3.select("#thegraph").attr("visibility", "visible");
		drawGraph();
	}
}
		
//filters first
function drawGraph() {
	
	filterNodes();
	var chartid="#thegraph";
	var chart=d3.select(chartid);

	var width = $(chartid).width(),
	    height = $(chartid).height();
	
	var force = d3.layout.force()
		.nodes(nodes)
		.links(links)
		.size([width, height])
		.linkDistance(250)
		.linkStrength(function(d){return d.linkStrength})
		.friction(0.8)
		.charge(-800)
		.chargeDistance(500)
		.theta(0.9)
		.gravity(0.3)
		.on("tick", tick)
		.start();
	

	// build the arrow.
	var defs=chart.selectAll("defs");
	if (defs.length == 0 || defs[0].length==0) chart.append("svg:defs").selectAll("marker")
		.data(["end"])      // Different link/path types can be defined here
	  .enter().append("svg:marker")    // This section adds in the arrows
		.attr("id", String)
		.attr("viewBox", "0 -5 10 10")
		.attr("refX", 10)
		.attr("refY", -1.5)
		.attr("markerWidth", 6)
		.attr("markerHeight", 6)
		.attr("orient", "auto")
	  .append("svg:path")
		.attr("d", "M0,-5L10,0L0,5");

	 // Update the links
    var path = chart.selectAll("path.link").data(links).attr("class", function(d) { return "link " + d.typekey + " " + d.opaType + " " +d.directionType; });
	// Enter any new links
	path.enter().insert("svg:path")
		.attr("class", function(d) { return "link " + d.typekey + " " + d.opaType + " " +d.directionType; })
		.attr("marker-end", "url(#end)")
		.on("mousemove", mousemoveTooltipLink)
          .on("mouseout", mouseoutTooltip);
	// Exit any old links.
    path.exit().remove();

	// Update the nodes
	var node = chart.selectAll(".nodes")
		.data(nodes, function(d) { return d.key; });
	node.select("circle")
		.attr("class", function(d) { 
			var myclass="node";
			if (d.isCurrentlyFocused) myclass = myclass+ " SELECTED"; 
			if (d.istarget) myclass = myclass + " NEW"; else myclass = myclass + " OLD";;
			return myclass})
		.attr("r", function(d){ 
				if (d.isCurrentlyFocused) d.radius=nodemaxradius; else d.radius=nodeminradius; 
				return d.radius;});
		
	// Enter any new nodes.
	var nodeEnter = node.enter().append("g")
		.attr("class", "nodes")
		.on("mousemove", mousemoveTooltipNode)
          .on("mouseout", mouseoutTooltip)
		  .on("dblclick", function(d){
            nodeClickInProgress=false;
            click_link(d);
        })
		.on("click",  function(d){
			if (d3.event.defaultPrevented) return; // dragged
			if (d3.event.ctrlKey) hideNode(d);
			else 
			// this is a hack so that click doesnt fire on the1st click of a dblclick
            if (!nodeClickInProgress ) {
                nodeClickInProgress = true;
                setTimeout(function(){
                    if (nodeClickInProgress) { 
                        nodeClickInProgress = false;
                        focusNode(d);
                    }
				},200); 
			}
        })
		.call(force.drag().on("dragstart", dragstart));
	
	function dragstart(d) {
		d3.select(this).classed("fixed", d.fixed = true);
	}

	// add the nodes
	nodeEnter.append("circle")
		.attr("class", function(d) { 
			var myclass="node";
			if (d.isCurrentlyFocused) myclass = myclass+ " SELECTED"; 
			if (d.istarget) myclass = myclass + " NEW"; else myclass = myclass + " OLD";;
			return myclass})
		.attr("r", function(d){ 
				if (d.isCurrentlyFocused) d.radius=nodemaxradius; else d.radius=nodeminradius; 
				return d.radius;})
		.attr("fill",function(d) { 
					return selectNodesColor(d);
				});  
		
	// add the text 
	nodeEnter.append("text")
		.attr("x", 12)
		.attr("dy", ".35em")
		.text(function(d) { if (lang==("DE")) { 
				if (d.key=="GENDER") return "Geschlecht";
				if (d.key=="AGE") return "Alter"; 
				if (d.key=="COUNT_ATC") return "Anzahl ATC"; 
				if (d.key=="COUNT_ICD") return "Anzahl ICD"; 
				} return d.key; 
		});
	// Exit any old nodes.
    node.exit().remove();
	
	// add the curvy lines
	function tick() {
		path.attr("d", function(d) {
            // Total difference in x and y from source to target
            var diffX = d.target.x - d.source.x,
            diffY = d.target.y - d.source.y;

            // Length of path from center of source node to center of target node
            var pathLength = Math.sqrt((diffX * diffX) + (diffY * diffY));

            // x and y distances from center to outside edge of target node
            var offsetX_t = (diffX * (d.target.radius)) / pathLength,
            offsetY_t = (diffY * (d.target.radius)) / pathLength,
			offsetX_s = (diffX * (d.source.radius)) / pathLength,
            offsetY_s = (diffY * (d.source.radius)) / pathLength;

            return "M" + (d.source.x+offsetX_s) + "," + (d.source.y+offsetY_s) + 
					"A" + pathLength + "," + pathLength + " 0 0,1 " +
					(d.target.x - offsetX_t) + "," + (d.target.y - offsetY_t);
        });
		node
			.attr("transform", function(d) { 
				return "translate(" + d.x + "," + d.y + ")"; });
	}
	
	fillNodesLabelOverview (nodes);
	
}

//color of nodes
function selectNodesColor(node) {
	if (node.typekey=="GEN") return "#aaa";
	
	//if (!d.istarget) return "#eee";
	//return color[d.typekey](d.clusterkey);
	 if (node.istarget)	return colorNodes[node.typekey]("NEW");
	else return colorNodes[node.typekey]("OLD");
}

function fillNodesLabelOverview (nodes) {
	//add nodes to overview
	$('.nodeUL').empty();
	
	sortednodes=sortArray(nodes,false);
	for (i = 0; i < sortednodes.length; i++) {
		var thislist = "#nodeULEx1";
		if (sortednodes[i].istarget && sortednodes[i].typekey=="DIS") thislist = "#nodeULPred1";
		if (sortednodes[i].istarget && sortednodes[i].typekey=="MED") thislist = "#nodeULPred2";	
		if (!sortednodes[i].istarget && sortednodes[i].typekey=="MED") thislist = "#nodeULEx2";	
		$(thislist).append('<li class="nodeLI" style="color:'+selectNodesColor(sortednodes[i])+';"><span>'+sortednodes[i].label+'</span></li>');
	}
}



<!-- Filter  -->
//some configurations before filtervalues + drawgraph are called
//
function filterChanger() {
	filtercriteria={};
	//set prevalence max to null
	var prev = {min:null, max:null};
	prev["min"]=$( "#prevslider" ).slider( "values", 0 )/100;	
	if ($( "#prevslider" ).slider( "values", 1 )>=$( "#prevslider" ).slider( "option", "max" )) prev["max"]=null;
	else prev["max"]=$( "#prevslider" ).slider( "values", 1 )/100;
	filtercriteria["prevalence"]=prev;
	
	//set seach input
	var label = {search: null};
	if ($( "#searchNode" ).val() != "") label["search"]=$( "#searchNode" ).val().toLowerCase();
	filtercriteria["label"]=label;
	
	//set risk threshold
	var threshold = {min:null, max:null};
	threshold["min"]=$( "#thresholdslider" ).slider( "values", 0 )/100;	
	filtercriteria["risk"]=threshold;
	
	//typekey
	var typekey = {typekeys:"GEN"};
	$("input:checkbox[name='nodetypes']:checked").each( function () {
		typekey["typekeys"]=typekey["typekeys"] + $(this).val();
	});
	filtercriteria["typekey"]=typekey;
}

function resetFilter() {
	$( "#prevslider" ).slider( "values", 0, prevalence_min );
	$( "#prevslider" ).slider( "values", 1, prevalence_max );
	if ($( "#prevslider" ).slider( "values", 1 )>=$( "#prevslider" ).slider( "option", "max" )) 
		$( "#prevalence" ).val( $( "#prevslider" ).slider( "values", 0 ) +      "% - MAX" );
	else 
		$( "#prevalence" ).val( $( "#prevslider" ).slider( "values", 0 ) +      "% - " + $( "#prevslider" ).slider( "values", 1 )+ "%" );
	
	$( "#searchNode" ).val("");
	$( "#searchNodeLabel" ).val("");
	
	$('input[name=topX]', '#view_form').filter('[value=10]').prop('checked', true);
	
	$( "#thresholdslider" ).slider( "value",0);
	$( "#threshold" ).val(">= " + $( "#thresholdslider" ).slider( "value")+ "%");
	
	$("input[name='nodetypes']").each( function () {$(this).prop('checked', true); });
	filtercriteria = {};
}

function toBeFilteredOut(node) {
	// all filter criteria goes here!
	if (node.hideNode) return true;
	var filterout=false;
	
	$.each(filtercriteria, function(k, v) {
		if (node[k]!=null) {
			if (v.min!=null) filterout=filterout || node[k]<v.min;
			if (v.max!=null) filterout=filterout || node[k]>v.max;
			if (v.search!=null) filterout=filterout || !(node[k].toLowerCase().indexOf(v.search)>=0);
			if (v.typekeys!=null) filterout=filterout || !(v.typekeys.indexOf(node[k])>=0);
		}
		if (filterout) return;
	});
	
	return filterout;
}

function filterNodes(){
    // we'll keep only the data where filterned nodes are the source or target
    var newNodes = [];
    var newLinks = [];
	var newLinks2 = [];

	//first: check for selected
    for (var i = 0; i < graphlinks.length ; i++) {
        var link = graphlinks[i];
        if (link.target.isCurrentlyFocused || link.source.isCurrentlyFocused) {
            newLinks.push(link);
        }
    }
    // if none are selected reinstate the whole dataset
    if (newLinks.length == 0) {
		newLinks=graphlinks;
    }
	
	//now: filter all other criteria
	for (var i = 0; i < newLinks.length ; i++) {
        var link = newLinks[i];
		var sourceOK=!toBeFilteredOut(link.source);
		var targetOK=!toBeFilteredOut(link.target);
		if (targetOK) addNodeIfNotThere(link.target,newNodes);
		if (sourceOK) addNodeIfNotThere(link.source,newNodes);
        if (targetOK && sourceOK) newLinks2.push(link);
    }
	
	links = newLinks2;
    nodes = newNodes;
    
    function addNodeIfNotThere( node, nodes) {
			for ( var i=0; i < nodes.length; i++) {
				if (nodes[i].key == node.key) return i;
			}
			return nodes.push(node) -1;
    }
}


<!-- List-Graph --> 
function drawListGraph(type_abs_rel,type_pos,chartid) {
	
	var chart=d3.select(chartid);
	chart.selectAll("g").remove();
	
	var subtree=listtree;
	for (j=0; j< listtree.length; j++) {
		if (listtree[j].key == type_pos) {
			subtree=listtree[j];
			break;
		}
	}

	var w = $(chartid).width(),
	    h = $(chartid).height(),
	    x = d3.scale.linear().range([0, w]),
	    y = d3.scale.linear().range([0, h]),
		kx_child_faktor = 2; //make last child (=risk) x times wider
		
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
		.on("mousemove", mousemoveTooltipNode)
          .on("mouseout", mouseoutTooltip)
		  .on("dblclick", click_link);

	  var kx = w,
	      ky = h / 1;

	  g.append("svg:rect")
	      .attr("width", function(d) { return d.children ? 
					kx * d.dy / kx_child_faktor :
					kx * d.dy * kx_child_faktor })
	      .attr("height", function(d) { return d.dx * ky; })
	      .attr("class", function(d) { return d.children ? "parent" : "child"; })
		  .attr("fill",function(d) { 
					if (!d.children && (!d.isnew || toBeFilteredOut(d)))  return "#eee";
					if (d.children) {
						if (d.key == "DIS" || d.key == "MED") return "#eee";
						else return color[type_pos](d.key);
					} else return color[type_pos](d.clusterkey);
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
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", lineHeight + dy + "em").text(word);
      }
    }
  });
 }

  function click_link(d) {
	    if (d.children) return;
		if (d.label)
			window.open("https://www.clinicalkey.com/#!/search/"+d.label.substr(d.label.indexOf(" ")));
	  }
 //TOOLTIP functions
 	var mousemoveTooltipNode = function(d) {
	  var xPosition = d3.event.pageX + 5;
	  var yPosition = d3.event.pageY + 5;

	  d3.select("#tooltip")
		.style("left", xPosition + "px")
		.style("top", yPosition + "px");
	  var mytext="";
	  if (d.label) mytext=d.label; else mytext=d.key;
	   if (!d.istarget && !d.children) mytext=mytext + " (existing)";
	  d3.select("#tooltip #t_heading")
			.text(mytext);

	  if (d.children) {
		  d3.select("#tooltip #t_type")
			.text("* statistical clusters are beta");
			d3.select("#tooltip #t_cluster")
			.text(null);
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
		  d3.select("#tooltip #t_type")
			.text("Type: " +  d.typelabel);
			d3.select("#tooltip #t_cluster")
			.text("Cluster: " +  d.clusterlabel + " (beta)");
		  d3.select("#tooltip #t_absrisk")
			.text("Abs. Risk: " +d.risk);
		  d3.select("#tooltip #t_relrisk")
			.text("Rel. Risk: " + d.rrisk);
		  d3.select("#tooltip #t_prev")
			.text("Prevalence: " + d.prevalence);
		  d3.select("#tooltip #t_inc")
			.text("Incidence: " + d.incidence);
		  d3.select("#tooltip #t_mean_age")
			.text("Mean Age of incidents: " + d.mean_age);
		  d3.select("#tooltip #t_link")
			.text("Double-click for ClinicalKey Content");
	 }
		  d3.select("#tooltip").classed("hidden", false);
	};
	
	var mousemoveTooltipLink = function(d) {
	  var xPosition = d3.event.pageX + 5;
	  var yPosition = d3.event.pageY + 5;

	  d3.select("#tooltip")
		.style("left", xPosition + "px")
		.style("top", yPosition + "px");
	  d3.select("#tooltip #t_heading")
			.text(d.source.key + " to " + d.target.key);
	  d3.select("#tooltip #t_type")
			.text("Type: " +  d.typelabel);
		d3.select("#tooltip #t_cluster")
			.text(null);
		d3.select("#tooltip #t_absrisk")
			.text("Odds Ratio: " + d.odds);
		  d3.select("#tooltip #t_relrisk")
			.text(null);
		  d3.select("#tooltip #t_prev")
			.text(null);
		 d3.select("#tooltip #t_inc")
			.text("Incidence: " + d.incidence);
		  d3.select("#tooltip #t_mean_age")
			.text("Mean Age: " + d.mean_age);
		  d3.select("#tooltip #t_link")
			.text(null);
			
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