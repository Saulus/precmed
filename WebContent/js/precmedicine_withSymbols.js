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
  });
  
  $(function() {
    $( "#numberslider" ).slider({
      min: 1,
      max: 1,
      value: 1,
      slide: function( event, ui ) {
		  $( "#numbernodes" ).val(ui.value);
      },
	  stop: function( event, ui ) {
		  drawGraphs(); 
	  }
    });
	$('#numberslider').slider('option','max',$('input[name=topX]:checked', '#view_form').val());
	$( "#numberslider" ).slider( "value",$('input[name=topX]:checked', '#view_form').val());
	$( "#numbernodes" ).val($( "#numberslider" ).slider( "value"));
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

$("#add_ATC").mouseover(function (e) {
	$("#ATCselector").css('top', e.clientY -15);
	$("#ATCselector").css('left', e.clientX-175);
	$("#ATCselector").show();
});

$("#ATCselector").mouseleave(function () {
	$("#ATCselector").hide();
});

$("#configure").mouseover(function (e) {
	$("#configurator").css('top', e.clientY-15);
	$("#configurator").css('left', e.clientX-$("#configurator").width()+15);
	$("#configurator").show();
});

$("#configurator").mouseleave(function () {
	$("#configurator").hide();
});

$("#legend").mouseover(function (e) {
	$("#thelegend").css('top', e.clientY-15);
	$("#thelegend").css('left', e.clientX-$("#thelegend").width()+15);
	$("#thelegend").show();
});

$("#thelegend").mouseleave(function () {
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

$("input[name=topX]:radio").change(function () {
	$('#numberslider').slider('option','max',$('input[name=topX]:checked', '#view_form').val());
	$( "#numberslider" ).slider( "value",$('input[name=topX]:checked', '#view_form').val());
	$( "#numbernodes" ).val($( "#numberslider" ).slider( "value"));
});

$('#view_form input').on('change', function() {
  GO(); 
});

$('#mode_form input').on('change', function() {
   selectNodesAndLinks($('input[name=view]:checked', '#view_form').val(),$('input[name=mode]:checked', '#mode_form').val());
   drawGraphs(); 
});

$('#searchNode').on('keyup', function() {
	drawGraphs(); 
});

$("input[name=nodetypes]:checkbox").change(function () {
	drawGraphs(); 
});



// Click on node: select
function clickNode(d) {
	d.isCurrentlyFocused = !d.isCurrentlyFocused;
	$('#searchNode').val('');
	drawGraphs();
}



<!-- GO  -->
function GO() {
	var postdata = {};
	postdata.view=$('input[name=view]:checked', '#view_form').val();
	postdata.lang=lang;
	postdata.topX=$('input[name=topX]:checked', '#view_form').val();;
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

		selectNodesAndLinks($('input[name=view]:checked', '#view_form').val(),$('input[name=mode]:checked', '#mode_form').val());
		drawGraphs();
		d3.select('#theImg').style("visibility","hidden");
	});
}

function selectNodesAndLinks(view_format,type_abs_rel) {
	if (graphdata==null) { GO(); return; }
	if (view_format=="LIST") {
		//find correct subtree
		listtree = graphdata;
		for (i=0; i< graphdata.children.length; i++) {
			if (graphdata.children[i].key == type_abs_rel) {
				listtree=graphdata.children[i].children;
				break;
			}
		}
	}
	if (view_format=="GRAPH") {
		//find correct subtree
			for (i=0; i< graphdata.children.length; i++) {
				if (graphdata.children[i].key == type_abs_rel) {
					for (j=0; j< graphdata.children[i].children.length; j++) {
						if (graphdata.children[i].children[j].key == "LINKS") graphlinks=graphdata.children[i].children[j].children;
						if (graphdata.children[i].children[j].key == "NODES") graphnodes=graphdata.children[i].children[j].children;
					}
					break;
				}
			}	
			//init isCurrentlyFocused
			for (k=0; k< graphnodes.length; k++) graphnodes[k].isCurrentlyFocused=false;		
			//assign node objects to links (instead of array pos)
			for (i=0; i< graphlinks.length; i++) {
					if (graphlinks[i].source.key) break; //objects already assigned
					sourceNo = graphlinks[i].source;
					targetNo = graphlinks[i].target;
					graphlinks[i].source = graphnodes[sourceNo];
					graphlinks[i].target = graphnodes[targetNo];
			}
			
			//init scale for opacity
			// Set the range
			var  v = d3.scale.linear().range([0, 100]);
			// Scale the range of the data
			v.domain([0, d3.max(graphlinks, function(d) { return d.oddstransformed; })]);
			// asign a opaType and directionType per value to encode opacity
			graphlinks.forEach(function(link) {
				if (v(link.oddstransformed) <= 25) {
					link.opaType = "twofive";
				} else if (v(link.oddstransformed) <= 50 && v(link.oddstransformed) > 25) {
					link.opaType = "fivezero";
				} else if (v(link.oddstransformed) <= 75 && v(link.oddstransformed) > 50) {
					link.opaType = "sevenfive";
				} else if (v(link.oddstransformed) <= 100 && v(link.oddstransformed) > 75) {
					link.opaType = "onezerozero";
				}
				if (link.odds<1) link.directionType = "lowers";
				else link.directionType = "increases";
			});
			
			
			//init size for prevalence
			v = d3.scale.linear().range([nodeminsize, nodemaxsize]);
			v.domain([0, 25]);
			
			graphnodes.forEach(function(node) {
				if (node.typekey=="GEN") node.size = nodemaxsize;
				else node.size = v(node.prevalence*100);
			});
			nodes=graphnodes;
			links=graphlinks;
	}
}

function drawGraphs () {
	//console.log("Draw");
	filterChanger();
	if (graphdata != null && $('input[name=view]:checked', '#view_form').val() == "LIST") {
		//d3.select("#thegraph").selectAll("*").remove();
		$("#chart_graph").hide();
		$("#charts").show();
		drawListGraph($('input[name=mode]:checked', '#mode_form').val(),"DIS","#chart_left");
		drawListGraph($('input[name=mode]:checked', '#mode_form').val(),"MED","#chart_right");
	} else if (graphdata != null && $('input[name=view]:checked', '#view_form').val() == "GRAPH") {
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
		.linkDistance(80)
		.charge(-500)
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
	node.select("path.node")
		.attr("class", function(d) { 
			var myclass="node";
			if (d.isCurrentlyFocused) myclass = myclass+ " SELECTED"; 
			if (d.istarget) myclass = myclass + " NEW"; else myclass = myclass + " OLD";;
			return myclass});
		
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
			// this is a hack so that click doesnt fire on the1st click of a dblclick
            if (!nodeClickInProgress ) {
                nodeClickInProgress = true;
                setTimeout(function(){
                    if (nodeClickInProgress) { 
                        nodeClickInProgress = false;
                        clickNode(d);
                    }
				},200); 
			}
        })
		.call(force.drag);
		
	// add the nodes
	 nodeEnter.append("path")
		.attr("class", function(d) { 
			var myclass="node";
			if (d.isCurrentlyFocused) myclass = myclass+ " SELECTED"; 
			if (d.istarget) myclass = myclass + " NEW"; else myclass = myclass + " OLD";;
			return myclass})
		.attr("fill",function(d) { 
					if (d.typekey=="GEN") return "#bbb";
					//if (!d.istarget) return "#eee";
					return color[d.typekey](d.clusterkey);
				})
		.attr("d", d3.svg.symbol()
                 .size(function(d) { return d.size })
                 .type(function(d) { if (d.istarget) { return "circle"; } else return "cross";}));  
	/*
	 nodeEnter.append(function(d) { if (d.istarget) return createSvgEl("circle"); return createSvgEl("cross");});
	
	nodeEnterSymbol.attr("r", function(d){ 
				return d.radius; })
				.size(200)
		//.attr("class", function(d) { if (d.istarget) return "NEW"; else return "OLD"; })
		.attr("fill",function(d) { 
					if (d.typekey=="GEN") return "#bbb";
					//if (!d.istarget) return "#eee";
					return color[d.typekey](d.clusterkey);
				});
*/
	// add the text 
	nodeEnter.append("text")
		.attr("x", 12)
		.attr("dy", ".35em")
		.text(function(d) { if (lang==("EN")) { if (d.key=="GESCHLECHT") return "Gender"; if (d.key=="ALTER") return "Age"; } return d.key; });
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
            var offsetX_t = (diffX * (d.target.size/30)) / pathLength,
            offsetY_t = (diffY * (d.target.size/30)) / pathLength,
			offsetX_s = (diffX * (d.target.size/30)) / pathLength,
            offsetY_s = (diffY * (d.target.size/30)) / pathLength;

            return "M" + (d.source.x+offsetX_s) + "," + (d.source.y+offsetY_s) + 
					"A" + pathLength + "," + pathLength + " 0 0,1 " +
					(d.target.x - offsetX_t) + "," + (d.target.y - offsetY_t);
        });
		node
			.attr("transform", function(d) { 
				return "translate(" + d.x + "," + d.y + ")"; });
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
	
	//set numbernodes
	var numbernodes = {min:null, max:null};
	numbernodes["max"]=$( "#numberslider" ).slider( "values", 0 )-1;	
	filtercriteria["topX"]=numbernodes;
	
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
	
	$( "#numberslider" ).slider( "value",$('input[name=topX]:checked', '#view_form').val());
	$( "#numbernodes" ).val($( "#numberslider" ).slider( "value"));
	
	$("input[name='nodetypes']").each( function () {$(this).prop('checked', true); });
	filtercriteria = {};
}

function toBeFilteredOut(node) {
	// all filter criteria goes here!
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
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
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