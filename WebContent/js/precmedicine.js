// INIT

//filter init
var prevalence_min=0, prevalence_max=15;
var age_min=0, age_max=99;
//var pvalue_max=0.05;

var linkDistance=100,
	chargeDistance=300,
	friction=0.5,
	charge=-1000,
	theta=0.9,
	alpha=0.3;

if (mode=="EXPLORE") {
	linkDistance=100;
	friction=0.5;
	charge=-1000;
	chargeDistance=300;
	theta=0.9,
	alpha=0.1;
}

var simulation = d3.forceSimulation();

//shim Object.values
Object.values = Object.values || (obj => Object.keys(obj).map(key => obj[key]));

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
var linkmode = {};

var number_focused = 0;

$.getJSON( ehealthurl+'Demo', function( jsondata ) {
	$("#demo").attr("max",jsondata);
});

//reset input fields
//Init = Reset
drawUI();
reset(); 

// load("ATC","#leftValuesATC"); -->


// LOADER -->
function load(loader,form) {
	var myurlstart=ehealthurl+'Lists'+'?lang='+lang+'&list=';
	
	var myvar = [],
		myurl = [],
		intsort=[];
	
	if (loader=="ICD" || loader=="ALL") {
		myvar.push('ICDlist');
		myurl.push(myurlstart+'ICD');
		intsort.push(false);
	}
	if (loader=="ATC" || loader=="ALL") {
		myvar.push('ATClist');
		myurl.push(myurlstart+'ATC');
		intsort.push(false);
	}
	
	$(form).find('option').remove();
	
	for (var v = 0; v < myvar.length; v++) {
		if (window[myvar[v]].length == 0) getfromurl(myurl[v],myvar[v],form,intsort[v]); //json getter is asychnron
		else {
			for (var i = 0; i < window[myvar[v]].length; i++) {
				$(form).append('<option value=' + window[myvar[v]][i].key + ' title="' + window[myvar[v]][i].value.label + '">' + window[myvar[v]][i].value.label + '</option>');
			}
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
		for (var i = 0; i < data.length; i++) {
			$(form).append('<option value=' + data[i].key + ' title="' + data[i].value.label + '">' + data[i].value.label + '</option>');
		}
		window[variable]=data;
	});
}

// UI -->
function drawUI() {

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
	
	 
	
	$( "#ageslider" ).slider({
      range: true,
      min: age_min,
      max: age_max,
      values: [ 0, 99 ],
      slide: function( event, ui ) {
		  if (ui.values[ 1 ]>=$( "#ageslider" ).slider( "option", "max" )) 
			$( "#mean_age" ).val( ui.values[ 0 ] + " - MAX" );
		  else $( "#mean_age" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ]);
      },
	  stop: function( event, ui ) {
		  drawGraphs(); 
	  }
    });
	if ($( "#ageslider" ).slider( "values", 1 )>=$( "#ageslider" ).slider( "option", "max" )) 
		$( "#mean_age" ).val( $( "#ageslider" ).slider( "values", 0 ) +      " - MAX" );
	else 
		$( "#mean_age" ).val( $( "#ageslider" ).slider( "values", 0 ) +      " - " + $( "#ageslider" ).slider( "values", 1 ));
}
  

// ACTIONS -->

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
	
	//hack: de-select if only one value is left to enable new select
	//if ($("#optionsICD option:selected").length == 1) $("#optionsICD option:selected").first().removeAttr("selected");
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
	
	//hack: de-select if only one value is left to enable new select
	//if ($("#optionsATC option:selected").length == 1) $("#optionsATC option:selected").first().removeAttr("selected");
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

$("#HOSP").change(function () {
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
			else if (key == "HOSP") $('#HOSP').prop('checked',value);
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
	resetSimulation();
	if (mode=="RISKS") {
		selectNodesAndLinksRiskMode();
	} else {
		//selectNodesAndLinksExploreMode($("#optionsEXPLORE option:selected").first().val());
		resetHidden();
	} 
	drawGraphs();
});

$('#view_form input').on('change', function() {
  GO(); 
});



$('#mode_form input').on('change', function() {
   selectNodesAndLinksRiskMode();
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

$("input[name=linkdepth]:radio").change(function () {
	drawGraphs(); 
});

$("input[name=significance]:radio").change(function () {
	drawGraphs(); 
});

$("input[name=influence]:radio").change(function () {
	drawGraphs(); 
});

$('#shownodeoverview').change(function() {
	 $( "#nodeoverview" ).toggle( "slide" );
});

$('#nodeoverviewX').click(function () {
	$('#shownodeoverview').prop( "checked", false );
	$( "#nodeoverview" ).toggle( "slide" );
});

//EXPLORER
$('#startEXPLORE').on('keyup', function(e) {	
	 origValue = $(this).val();
	if (!$("#EXPLOREselector").is(':visible')) {
		$("#EXPLOREselector").css('top', $("#startEXPLORE").offset().top + $("#startEXPLORE").outerHeight());
		$("#EXPLOREselector").css('left', $("#startEXPLORE").offset().left);
		$('#EXPLOREselector').show(); 
	}
	search("#optionsEXPLORE",$(this).val(),false);
	
	//hack: de-select if only one value is left to enable new select
	if ($("#optionsEXPLORE option:selected").length == 1) $("#optionsEXPLORE option:selected").first().removeAttr("selected");
	
	//Autocomplete... does not work (yet)
	/*
	//find autocomplete value
	newvalue = $("#optionsEXPLORE option:selected").first().text();
    diff = newvalue.length - origValue.length;
	
	if (diff <= 0) return 0;
	remainingChars = newvalue.substr(origValue.length);
	
	//$(this).val(origValue + remainingChars);
	//this.setSelectionRange( origValue.length,remainingChars.length + origValue.length);
	*/
});

$('#startEXPLORE').click(function () {
	$("#EXPLOREselector").css('top', $("#startEXPLORE").offset().top + $("#startEXPLORE").outerHeight());
	$("#EXPLOREselector").css('left', $("#startEXPLORE").offset().left);
	$('#EXPLOREselector').show(); 
});

$("#EXPLOREselectorX").click(function () {
	$("#EXPLOREselector").hide();
});
$("#clearEXPLORE").click(function () {
	clearsearch("#optionsEXPLORE","#startEXPLORE","ALL");
	//$("#EXPLOREselector").hide();
});
$("#optionsEXPLORE").change(function () {
	$('#startEXPLORE').val($("#optionsEXPLORE option:selected").first().text());
	//drawGraphs(); 
	refreshGraphSingle($("#optionsEXPLORE option:selected").first().val());
	$("#EXPLOREselector").hide();
});








// Click on node: select
function focusNode(d) {
	d.isCurrentlyFocused = !d.isCurrentlyFocused;
	if (d.isCurrentlyFocused) number_focused = number_focused+1; else  number_focused = number_focused-1;
	$('#searchNode').val('');
	$('#searchNodeLabel').val('');
	if (mode=="EXPLORE" && d.isCurrentlyFocused) refreshGraphSingle(d.key)
	else drawGraphs();
}

function hideNode(d) {
	d.hideNode = true;
	d3.select("#tooltip").classed("hidden", true);
	drawGraphs();
}



// GO  -->
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
	postdata.HOSP = $('#HOSP').prop('checked');
	refreshGraph(JSON.stringify(postdata));
}

// Helper Functions -->

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
	for (var i = 0; i < window[globalVarList].length; i++) {
		if ($.inArray(window[globalVarList][i].key,addList)>-1) {
			var label = window[globalVarList][i].value.label;
			var item = '<option value=' + window[globalVarList][i].key + ' title="' + label + '">' + label + '</option>';
			addToForm(item,form,intsort);
			added = true;
		}
	}
}
function move(from,to,intsort) {
	var selectedItem = $(from+" option:selected");
    //$("#rightValues").append(selectedItem);
    //$("#txtRight").val(selectedItem.text());
    //var targetList =$(to+" option");
	$(selectedItem).each(function(){
		var item = $(this);
		addToForm(item,to,intsort);
	});
	GO();
}


function reset() {
	if (mode=="RISKS") {
		$("#valuesICD").find('option').remove();
		$("#valuesATC").find('option').remove();
		
		clearsearch("#optionsICD","#searchICD","ICD");
		clearsearch("#optionsATC","#searchATC","ATC");
	} else {
		clearsearch("#optionsEXPLORE","#startEXPLORE","ALL");
	}

	//remove all from graph
	d3.selectAll("#thegraph > *").remove();
	//and from table
	d3.selectAll(".list > *").remove();
	if ($("#nodeoverview").is(':visible')) $( "#nodeoverview" ).toggle( "slide" );
	$('#shownodeoverview').prop('checked', false);
	$('.nodeUL').empty();
	
	
	resetFilter();
	resetSimulation();
	
	graphdata=null;
	graphnodes = {};
	graphlinks = {};
	nodes = {};
	links = {};
	nodeClickInProgress=false;
	listtree = null;
	number_focused=0;
	
	//$("#demo").val(0);
	//$("#ALTER").val(40);
}

function resetSimulation() {
	simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d; }).distance(linkDistance).strength(function(d){return d.linkStrength}))
    .force("charge", d3.forceManyBody().strength(charge).theta(theta).distanceMax(chargeDistance))
    .force("center", d3.forceCenter($("#thegraph").width() / 2, $("#thegraph").height() / 2));
	//.velocityDecay(friction);
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

// Grafik functions -->


function refreshGraph(parameters) {
	d3.select('#theImg').style("visibility","visible");
	d3.json(ehealthurl+'Graph').post(parameters,
	  function (error,jsondata) {
		if (error) return console.warn(error);
		
		graphdata=jsondata;

		selectNodesAndLinksRiskMode();
		drawGraphs();
		d3.select('#theImg').style("visibility","hidden");
	});
}


function refreshGraphSingle(key) {
	var postdata = {};
	postdata.KEY=key;
	postdata.lang=lang;
	d3.select('#theImg').style("visibility","visible");
	d3.json(ehealthurl+'Single').post(JSON.stringify(postdata),
	  function (error,jsondata) {
		if (error) return console.warn(error);
		
		graphdata=jsondata;

		selectNodesAndLinksExploreMode(key);
		drawGraphs();
		d3.select('#theImg').style("visibility","hidden");
	});
}

function initNodes(mynodes,focuskey) {
	//init Nodes:
			//isCurrentlyFocused and hideNode and fixed and position
			var n = Object.keys(mynodes).length,
				width= $("#thegraph").width(),
				height= $("#thegraph").height(),
				k=1;
			Object.keys(mynodes).forEach(function (key) {
				mynodes[key].isCurrentlyFocused=false;		
				if (focuskey != null && key == focuskey ) mynodes[key].isCurrentlyFocused=true;		
				mynodes[key].hideNode=false;
				mynodes[key].fixed = false;
				mynodes[key].fx=null;
				mynodes[key].fy=null;
				//order on screen by cluster -> not working for too many and/or unsorted clusters
				//mynodes[k].x = Math.cos((mynodes[k].clusterkey+1) / numberClusters * 2 * Math.PI) * 200 + width / 2 + (Math.random()*10);
				//mynodes[k].y = Math.sin((mynodes[k].clusterkey+1) / numberClusters * 2 * Math.PI) * 200 + height / 2 + (Math.random()*10);
				
				//order diagonally
				//mynodes[k].x = width / n * k;
				//mynodes[k].y = height / n * k;
				
				//order by istarget: old left, new right
				
				if (mynodes[key].istarget) {
					mynodes[key].x = width * 0.7;
					mynodes[key].y = height / n * k;
				} else {
					mynodes[key].x = width * 0.3;
					mynodes[key].y = height / n * k;
				}
				k += 1;
				//console.log(mynodes[key].key + " " +mynodes[key].clusterkey + " " + mynodes[key].x + " " + mynodes[key].y);
				
				mynodes[key].radius=nodeminradius;
			});
			
			//init radius for prevalence
			//v = d3.scale.linear().range([nodeminradius, nodemaxradius]);
			//v.domain([0, 25]);
			/*
			mynodes.forEach(function(node) {
				if (node.typekey=="GEN") node.radius = nodeminradius;
				//else node.radius = v(node.prevalence*100);
				else node.radius = nodeminradius;
			});*/
}

function initLinks(mylinks,mynodes,existingLinks) {
	//existingLinks: only if links shall be added (if new), otherwise leave this null
	var existingLinksOld = jQuery.extend({}, existingLinks);
	//Init Links
			//...assign node objects to links (instead of array pos)
			//...init scale for opacity
			//..init linkStrength
			// Set the range
			//var  v = d3.scaleLinear().range([0, 100]);
			// Scale the range of the data
			//v.domain([-5, 5]);
			
	if (!mylinks[Object.keys(mylinks)[0]].source.key) { //only if objects not already assigned
			Object.keys(mylinks).forEach(function (key) {
					//if (mylinks[key].source.key) break; //objects already assigned
					mylinks[key].key=key;
					sourceKey = mylinks[key].source;
					targetKey = mylinks[key].target;
					mylinks[key].source = mynodes[sourceKey];
					mylinks[key].target = mynodes[targetKey];
					//test existing, and add if new
					if (existingLinks) if (doesLinkExist(mylinks[key],existingLinksOld) == null) existingLinks[key]=mylinks[key];
					// assign a opaType and directionType per value to encode opacity
					beta_tr = Math.abs(mylinks[key].beta);
					if (beta_tr > 1) {
						mylinks[key].opaType = "strongest";
						mylinks[key].linkStrength = 1;
					} else if (beta_tr > 0.1) {
						mylinks[key].opaType = "strong";
						mylinks[key].linkStrength = 0.75;
					} else if (beta_tr > 0.01) {
						mylinks[key].opaType = "weak";
						mylinks[key].linkStrength = 0.5;
					} else {
						mylinks[key].opaType = "weakest";
						mylinks[key].linkStrength = 0.25;
					}
					if (mylinks[key].odds<1.0) mylinks[key].directionType = "lowers";
					else mylinks[key].directionType = "increases";
			});
	}
}

function selectNodesAndLinksRiskMode() {
	if (graphdata==null) { GO(); return; }
	
	//LIST or GRAPH
	listtree = graphdata.children["LIST"].children;
	graphlinks=graphdata.children["GRAPH"].children["LINKS"].children;
	graphnodes=graphdata.children["GRAPH"].children["NODES"].children;
	
	initNodes(graphnodes);
	initLinks(graphlinks,graphnodes,null);
			
	nodes=graphnodes;
	links=graphlinks;
}

function selectNodesAndLinksExploreMode(key) {
	if (graphdata==null) { refreshGraphSingle(key); return; }
	
	//select new nodes and links
	newlinks=graphdata.children["LINKS"].children;
	newnodes=graphdata.children["NODES"].children;
	
	//init nodes 
	initNodes(newnodes,key);	
	//now add to existing nodes and links
	if (Object.keys(graphnodes).length==0) graphnodes=newnodes;
	else {
		Object.keys(newnodes).forEach(function (key) {
			if ((exnode = doesNodeExist(newnodes[key],graphnodes)) == null) graphnodes[key]=newnodes[key]; //new node
			else {
				var isfocused = newnodes[key].isCurrentlyFocused;
				newnodes[key]=exnode; //node exists -> replace to find correct links
				if (isfocused) newnodes[key].isCurrentlyFocused=true;
			}
		});
	}
	
	//init links and add to existing 
	initLinks(newlinks,newnodes,graphlinks);
		
	
	nodes=graphnodes;
	links=graphlinks;
}

function doesNodeExist(node,searchnodes) {
	return searchnodes[node.key];
}

function doesLinkExist(link,searchlinks) {
	return searchlinks[link.source.key+link.target.key];
}

function drawGraphs () {
	//console.log("Draw");
	filterChanger();
	
	if (mode=="RISKS") {
		var active = $( "#tabs" ).tabs( "option", "active" );
		
		if (graphdata != null && active == 0) {
			//d3.select("#thegraph").selectAll("*").remove();
			$("#chart_graph").hide();
			$("#charts").show();
			drawListGraph("ABS","#chart_abs");
			drawListGraph("REL","#chart_rel");
			//also pre-draw graph 
			//drawGraph();
		} else if (graphdata != null && active == 1) {
			$("#charts").hide();
			$("#chart_graph").show();
			//d3.select("#thegraph").attr("visibility", "visible");
			drawGraph();
		}
	} else drawGraph();
}
		

//filters first
function drawGraph() {
	
	filterNodes();
	var chartid="#thegraph";
	var chart=d3.select(chartid);

	var width = $(chartid).width(),
	    height = $(chartid).height();
		
	
	nodes_arr=Object.values(nodes);
	links_arr=Object.values(links);
	
		
	// build the arrow.
	var defs=chart.selectAll("defs");
	if (defs.empty()) chart.append("svg:defs").selectAll("marker")
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
	//First: Link group
	var all_links = chart.select(".all_links");
	if (all_links.empty()) all_links = chart.append("g").attr("class", "all_links");
	
	var path = all_links
		.selectAll("path.link")
		.data(links_arr, function(d) { return d.key; });
	 path.exit().remove(); //EXIT
	 
	var pathEnter = path.enter().insert("svg:path") //ENTER
		.attr("class", function(d) { return "link " + d.typekey + " " + d.opaType + " " +d.directionType; })
		.attr("marker-end", "url(#end)")
		.on("mousemove", mousemoveTooltipLink)
          .on("mouseout", mouseoutTooltip);
	
	path = path.merge(pathEnter); // ENTER + UPDATE

	
	 // Update the nodes
	var all_nodes = chart.select(".all_nodes");
	 if (all_nodes.empty()) all_nodes = chart.append("g").attr("class", "all_nodes");

	var node = all_nodes.selectAll(".nodes") //UPDATE
		.data(nodes_arr, function(d) { return d.key; });
		
	node.exit().remove(); //EXIT

	var nodeEnter = node.enter().append("g") //ENTER
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
		.call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));
		  
	nodeEnter.append("circle")
		.attr("fill",function(d) { 
					return selectNodesColor(d);
				});
	
	nodeEnter
		.append("text")
		.attr("x", 12)
		.attr("dy", ".35em")
		.text(function(d) { if (lang==("DE")) { 
				if (d.key=="GENDER") return "Geschlecht";
				if (d.key=="AGE") return "Alter"; 
				if (d.key=="COUNT_ATC") return "Anzahl ATC"; 
				if (d.key=="COUNT_ICD") return "Anzahl ICD"; 
				} return d.key; 
		});			
		
	node = node.merge(nodeEnter);
	node.select("circle")
		.attr("class", function(d) { 
			var myclass="node";
			if (d.isCurrentlyFocused) myclass = myclass+ " SELECTED"; 
			if (d.istarget) myclass = myclass + " NEW"; else myclass = myclass + " OLD";;
			return myclass})
		.attr("r", function(d){ 
				if (d.isCurrentlyFocused) d.radius=nodemaxradius; else d.radius=nodeminradius; 
				return d.radius;})
		;  
		
	  function dragstarted(d) {
	  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
	  d.fx = d.x;
	  d.fy = d.y;
	}

	function dragged(d) {
	  d.fx = Math.max(d.radius, Math.min(width - d.radius, d3.event.x));
	  d.fy = Math.max(d.radius, Math.min(height - d.radius, d3.event.y));
	}

	function dragended(d) {
	  if (!d3.event.active) simulation.alphaTarget(0);
	  /*d.fx = null;
	  d.fy = null;*/
	  d3.select(this).classed("fixed", d.fixed = true);
	}
	
	//simulation.restart();
	if (simulation.alpha() < 0.05)
		simulation.alpha(alpha).restart();
	simulation
      .nodes(nodes_arr)
      .on("tick", ticked);

  simulation.force("link")
      .links(links_arr);

  function ticked() {
    path
        .attr("d", function(d) {
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
				d.x = Math.max(d.radius, Math.min(width - d.radius, d.x)); //set boundary
				d.y = Math.max(d.radius, Math.min(height - d.radius, d.y));
				return "translate(" + d.x + "," + d.y + ")"; });
		
  }

	fillNodesLabelOverview (nodes);
	
}

//color of nodes
function selectNodesColor(node) {
	//if (node.typekey=="GEN") return "#aaa";
	
	//if (!d.istarget) return "#eee";
	//return color[d.typekey](d.clusterkey);
	 if (node.istarget)	return colorNodes[node.typekey]("NEW");
	else return colorNodes[node.typekey]("OLD");
}

function fillNodesLabelOverview (nodes) {
	//add nodes to overview
	$('.nodeUL').empty();
	
	//sortednodes=sortArray(nodes,false); //ToDo: use by Key HashSet?
	Object.keys(nodes).forEach(function (key) {
		if (nodes[key].typekey!="GEN") {
			var thislist = "#nodeULEx1";
			if (nodes[key].istarget && nodes[key].typekey=="ICD") thislist = "#nodeULPred1";
			if (nodes[key].istarget && nodes[key].typekey=="ATC") thislist = "#nodeULPred2";	
			if (!nodes[key].istarget && nodes[key].typekey=="ATC") thislist = "#nodeULEx2";	
			$(thislist).append('<li class="nodeLI" style="color:'+selectNodesColor(nodes[key])+';"><span>'+nodes[key].label+'</span></li>');
		}
	});
}



// Filter  -->
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
	
	//set mean age
	var age = {min:null, max:null};
	age["min"]=$( "#ageslider" ).slider( "values", 0 );	
	if ($( "#ageslider" ).slider( "values", 1 )>=$( "#ageslider" ).slider( "option", "max" )) age["max"]=null;
	else age["max"]=$( "#ageslider" ).slider( "values", 1 );
	filtercriteria["mean_age"]=age;
	
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
	
	linkmode["linkdepth_ALL"]=$('input[name=linkdepth]:checked', '#config_form').val()=="ALL";
	linkmode["significance_ALL"]=$('input[name=significance]:checked', '#config_form').val()=="ALL";
	linkmode["influence_ALL"]=$('input[name=influence]:checked', '#config_form').val()=="ALL";

}

function resetFilter() {
	$( "#prevslider" ).slider( "values", 0, prevalence_min );
	$( "#prevslider" ).slider( "values", 1, prevalence_max );
	if ($( "#prevslider" ).slider( "values", 1 )>=$( "#prevslider" ).slider( "option", "max" )) 
		$( "#prevalence" ).val( $( "#prevslider" ).slider( "values", 0 ) +      "% - MAX" );
	else 
		$( "#prevalence" ).val( $( "#prevslider" ).slider( "values", 0 ) +      "% - " + $( "#prevslider" ).slider( "values", 1 )+ "%" );
	
	$( "#ageslider" ).slider( "values", 0, age_min );
	$( "#ageslider" ).slider( "values", 1, age_max );
	if ($( "#ageslider" ).slider( "values", 1 )>=$( "#ageslider" ).slider( "option", "max" )) 
		$( "#mean_age" ).val( $( "#ageslider" ).slider( "values", 0 ) +      " - MAX" );
	else 
		$( "#mean_age" ).val( $( "#ageslider" ).slider( "values", 0 ) +      " - " + $( "#ageslider" ).slider( "values", 1 ));
	
	$( "#searchNode" ).val("");
	$( "#searchNodeLabel" ).val("");
	
	$('input[name=topX]', '#view_form').filter('[value=3]').prop('checked', true);
	
	$( "#thresholdslider" ).slider( "value",0);
	$( "#threshold" ).val(">= " + $( "#thresholdslider" ).slider( "value")+ "%");
	
	$("input[name='nodetypes']").each( function () {$(this).prop('checked', true); });
	
	$('input[name=linkdepth]', '#config_form').filter('[value=DIRECT]').prop('checked', true);
	
	if (mode=="EXPLORE") {
		$('input[name=significance]', '#config_form').filter('[value=ONLY]').prop('checked', true);
		$('input[name=influence]', '#config_form').filter('[value=ONLY]').prop('checked', true);
	}
	else {
		$('input[name=significance]', '#config_form').filter('[value=ONLY]').prop('checked', true);
		$('input[name=influence]', '#config_form').filter('[value=ONLY]').prop('checked', true);
	}
	
	filtercriteria = {};
	linkmode={};

}

function resetHidden() {
	Object.keys(graphnodes).forEach(function (key) {
		graphnodes[key].hideNode=false;
		//graphnodes[i].fixed = false;
	});
}

function toBeFilteredOut(node) {
	// all filter criteria goes here!
	if (node.hideNode) return true;
	if (node.isCurrentlyFocused) return false;
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

function showLink(link,exploreMode,focusedOnly) {
	var isfine = true;
	if (exploreMode) {
		if (focusedOnly && !linkmode["linkdepth_ALL"]) 
			isfine = (link.target.isCurrentlyFocused || link.source.isCurrentlyFocused);
		else isfine=true;
		if (!linkmode["significance_ALL"]) isfine=isfine && link.isSignificant;
		if (!linkmode["influence_ALL"]) isfine=isfine && (link.directionType != "lowers");
		return isfine;
	} else {
		if (!linkmode["linkdepth_ALL"]) 
			isfine = (!link.source.istarget && link.target.istarget);
		if (focusedOnly) 
			isfine = isfine && (link.target.isCurrentlyFocused || link.source.isCurrentlyFocused);
		if (!linkmode["significance_ALL"]) isfine=isfine && link.isSignificant;
		if (!linkmode["influence_ALL"]) isfine=isfine && (link.directionType != "lowers");
		return isfine ;
	}
	
	/*
	if (modus == "CONNECTED" && number_focused>=2) { //not used, for explore mode
		isfine = link.target.isCurrentlyFocused && link.source.isCurrentlyFocused;
	}*/
	return isfine;
}

function filterNodes(){
    var newNodes = {}; 
    var newLinks = {};
	var newLinks2 = {};
	
	//first: filter out nodes
	Object.keys(graphnodes).forEach(function (key) {
		graphnodes[key].hideNode=toBeFilteredOut(graphnodes[key]);
	});
	
	//now filter links -> first: check for selected
	var found=false;
	Object.keys(graphlinks).forEach(function (key) {
		if (showLink(graphlinks[key],mode=="EXPLORE",true)) {
				newLinks[key]=graphlinks[key];
				found=true;
		}
	});

    // if none are selected reinstate the whole dataset
    if (!found) {
		newLinks=graphlinks;
    }
	
	//now: filter all other criteria
	Object.keys(newLinks).forEach(function (key) {
        var link = newLinks[key];
		var sourceOK=!link.source.hideNode;
		var targetOK=!link.target.hideNode;
        if (targetOK && sourceOK && showLink(link,mode=="EXPLORE",false)) {
			newNodes[link.target.key]=link.target; // we'll keep only the data where filtered nodes are the source or target
			newNodes[link.source.key]=link.source;
			newLinks2[key] = link;
		}
    });
	
	links = newLinks2;
    nodes = newNodes;
  
}


// List-Graph --> 

function getChildren(o,type) {
	/*for (j=0; j< array.children.length; j++) {
		if (array.children[j].key==type) return array.children[j].children;
	}*/
	if (o.children[type]) return o.children[type].children;
	return null;
}

function getRiskNode (o) {
	return Object.values(getChildren(o,"has_successor"))[0];
}

function getFullLabelText(o,type) {
	info=getChildren(o,type);
	if (info==null) return "";
	text = "";
	Object.keys(info).forEach(function (key) {
		if (!info[key].isnew) 
			text = text + "<li><b>"+info[key].label+"</b></li>";
		else text = text +"<li>"+info[key].label+"</li>";
	});
	return text;
}

var columns = [
    { head_en: 'Disease', head_de: 'Erkrankung', basecl: 'listtable disease',
      html: function(row) { return row.label; }, 
	  is_ul: false },
	  
	{ head_en: 'Group', head_de: 'Gruppe', basecl: 'listtable group',
      html: function(row) { info=getRiskNode(row); return "<FONT COLOR="+color[info.typekey](info.clusterkey)+">"+info.clusterlabel+"</font>"; }, 
	  is_ul: false },
	  
    { head_en: 'Risk (abs/rel)', head_de: 'Risiko (abs/rel)', basecl: 'listtable risk',
      html: function(row) { info=getRiskNode(row); return round(info.risk*100,0) + "% / " + round(info.rrisk,1); }, 
	  is_ul: false },
	  
    { head_en: 'Prevalence / Incidence', head_de: 'Prävalenz / Incidenz', basecl: 'listtable prevalence',
      html: function(row) { info=getRiskNode(row); return round(info.prevalence*100,1) + "% / " + round(info.incidence*100,1) +"% (at " + info.mean_age + ")"; }, 
	  is_ul: false },
	  
    { head_en: 'Risk Factors ', head_de: 'Risikofaktoren', basecl: 'listtable factors',
      html: function(row) { return getFullLabelText(row,"has_risk_factor");  }, 
	  is_ul: true },
	  
    { head_en: 'Diagnostic Procedures', head_de: 'Diagnostik', basecl: 'listtable diagnostics',
		html: function(row) { return getFullLabelText(row,"has_diagnostic_procedure"); }, 
	  is_ul: true },
		
	{ head_en: 'Prevention', head_de: 'Prävention', basecl: 'listtable prevention',
      html: function(row) { return getFullLabelText(row,"has_prevention"); }, 
	  is_ul: true }
];

function drawListGraph(type_pos,chartid) {
	
	if (lang==("DE")) engl = false;
	else engl=true;
	
	var chart=d3.select(chartid);
	chart.selectAll("thead").remove();
	chart.selectAll("tbody").remove();
	
	var subtree=listtree[type_pos].children;

	var w = $(chartid).width(),
	    h = $(chartid).height();
	    /*x = d3.scale.linear().range([0, w]),
	    y = d3.scale.linear().range([0, h]),
		kx_top_width = 0.15; 
		kx_middle_width = 0.3; 
		kx_last_width = 0.55; */
		
	chart.append('thead').append('tr')
		.selectAll('th')
		.data(columns).enter()
		.append('th')
		//.attr('class', function(col) {return col.basecl})
		.text(function(col) {if (engl) return col.head_en; else return col.head_de });	
	
	chart.append('tbody')
		.selectAll('tr')
		.data(Object.values(subtree)).enter()
		.append('tr')
		.attr('class', function(row, i) {
			d=getRiskNode(row);
			if (toBeFilteredOut(d)) return 'row_filtered';
			if (i%2 == 0) return "row_0";
			else return "row_1";
		})
		/*.attr('bgcolor', function(row) { 
				d=getRiskNode(row);
				return color[d.typekey](d.clusterkey);
		})*/
		/*.on("mousemove", mousemoveTooltipNode)
          .on("mouseout", mouseoutTooltip)*/
		  .on("dblclick", function(node){
			  d=getRiskNode(node);
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
                        switch2graph(getRiskNode(d));
                    }
				},200); 
			}
        })
		.selectAll('td')
		.data(function(row, i) {
			// evaluate column objects against the current row
		   return columns.map(function(c) {
			   var cell = {};
			   d3.keys(c).forEach(function(k) {
				   cell[k] = typeof c[k] == 'function' ? c[k](row,i) : c[k];
			   });
			   return cell;
		   });
		}).enter()
		.append('td')
		.attr('class', function(col) {return col.basecl})
		.on("mousemove", mousemoveTooltipListCell)
          .on("mouseout", mouseoutTooltip)
		 .html(function(col) {
			 text = col.html;
			 if (col.is_ul) {
				text='<div class="labellist_div"><ul class="tableUL">'+text+"</ul></div>";
			 }
			 return text})
		;
			  
}

function wrap(text) {
  text.each(function() {
    var text = d3.select(this),
		width = text.attr("width")-5,
		height = text.attr("height"),
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
      if (tspan.node().getComputedTextLength() > width ) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
		lineNumber++;
		if (lineHeight * lineNumber * 16 <= (height*0.6)) /* TODO: move last line up; find better way to locate end of height*/
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
	  
 function switch2graph(d) {
	 if (d.children) return;
	 if (d.key) {
		 //focus
		Object.keys(graphnodes).forEach(function (key) {
			if (key == d.key) {
				graphnodes[key].isCurrentlyFocused=true;
			} else graphnodes[key].isCurrentlyFocused=false;
			graphnodes[key].hideNode=false;
			graphnodes[key].fixed = false;
		});
		$( "#tabs" ).tabs({ active: 1 });
	 }
 }
	  
 //TOOLTIP functions
 //HELPERS
 
 function positionTooltip () {
	  var xPosition = d3.event.clientX + 5;
	  var yPosition = d3.event.clientY + 5;
	  
	  var xMax = window.innerWidth, //document.documentElement.clientWidth,
	  yMax=window.innerHeight; // document.documentElement.clientHeight;

	  if (xPosition + $("#tooltip").width() > xMax ) xPosition=xMax -$("#tooltip").width()+15;
	  if (yPosition + $("#tooltip").height() > yMax) yPosition=yMax-$("#tooltip").height()-15;

	  d3.select("#tooltip")
		.style("left", xPosition + "px")
		.style("top", yPosition + "px");
	  d3.select("#tooltip").classed("hidden", false);
 }
 
  function resetTooltipContent () {
	  d3.select("#tooltip #t_heading")
		.text(null);
	  d3.select("#tooltip #t_type")
			.text(null);
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
			
	 d3.select("#tooltip").style("width","240px");
  }  
 
 //REAL TOOLTIP FUNCTIONS
 
 	var mousemoveTooltipNode = function(d) {
	  resetTooltipContent ();
	  var mytext="";
	  if (d.label) mytext=d.label; else mytext=d.key;
	   if (!d.istarget && !d.children && mode=="RISKS") mytext=mytext + " (existing)";
	  
	  d3.select("#tooltip #t_heading")
			.text(mytext);
	  if (!d.children) {
		  /*d3.select("#tooltip #t_type")
			.html("<td width=50>Type:</td><td>" +  d.typelabel+"</td>");*/
			d3.select("#tooltip #t_cluster")
			.html("<td width=80>Group:</td><td>" +  d.clusterlabel+"</td>");
			if (mode=="RISKS" && d.istarget) {
			  d3.select("#tooltip #t_absrisk")
				.html("<td>Score:</td><td>" +round(d.risk,2) + "</td>");
			  d3.select("#tooltip #t_relrisk")
				.html("<td>Rel. score:</td><td>" + round(d.rrisk,1)+"</td>");
			}
			if (d.typekey == "ICD") {
				d3.select("#tooltip #t_prev")
				.html("<td>Prevalence:</td><td>" + round(d.prevalence * 100,1)+ "%"+"</td>");
			  d3.select("#tooltip #t_inc")
				.html("<td>Incidence:</td><td>" + round(d.incidence * 100,1)+ "%"+"</td>");
			  d3.select("#tooltip #t_mean_age")
				.html("<td>Mean age of incidents:</td><td>" + d.mean_age+"</td>");
			  d3.select("#tooltip #t_link")
				.html("<td colspan=2>Double-click for ClinicalKey Content</td>");
			} else {
				if (d.typekey == "ATC" || d.key == "HOSP")
					d3.select("#tooltip #t_prev")
						.html("<td>Prevalence:</td><td>" + round(d.prevalence * 100,1)+ "%"+"</td>");
				else 
					d3.select("#tooltip #t_prev")
						.html("<td>Prevalence:</td><td>" + round(d.prevalence,1)+"</td>");
			}
	 }
	 
	 positionTooltip();
		
	};
	
	var mousemoveTooltipLink = function(d) {
		resetTooltipContent ();
	 significant = d.isSignificant;;
	 if (significant)
		 sig_str=" *";
	 else sig_str="";
	  d3.select("#tooltip #t_heading")
			.text(d.source.key + " to " + d.target.key + sig_str);
	  d3.select("#tooltip #t_type")
			.html("<td width=80>Type:</td><td>" +  d.typelabel+"</td>");
		d3.select("#tooltip #t_absrisk")
			.html("<td>Odds ratio:</td><td>" + round(d.odds,3)+"</td>");
		 d3.select("#tooltip #t_inc")
			.html("<td>Incidence:</td><td>" + round(d.proportion_source_get_incidents* 100,2)+"%"+"</td>");
		  d3.select("#tooltip #t_mean_age")
			.html("<td>Mean age:</td><td>" + d.mean_age+"</td>");
		if (significant)
		  d3.select("#tooltip #t_link")
			.html("<td colspan=2>* significant correlation</td>");
		
		positionTooltip();
	};
	
	
	var mousemoveTooltipListCell = function(col) {
		resetTooltipContent ();
		text = col.html;
		colnumber=Math.floor(text.length/800)+1;
		d3.select("#tooltip").style("width",(colnumber*240)+"px");
		
	  d3.select("#tooltip #t_heading")
		.text(col.head_en);

		text = col.html;
		var ulclass = "tableUL";
		if (colnumber>1) ulclass=ulclass+" multicolumn"+colnumber;
		text='<ul class="'+ulclass+'">'+text+'</ul>';
	  d3.select("#tooltip #t_type")
			.html(text);

		positionTooltip();
	};

	var mouseoutTooltip = function() {
	  d3.select("#tooltip").classed("hidden", true);
	};


/* my very own sorting function, as jQuery sort is not working in Chrome */
function sortArray(array, intsort) {
	var map = [],
		result = [];

	if (array===null || array === undefined || array.length == 0) return [];
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

function round(value, decimals) {
	var result = 1,
		runs =0;
	do {
		result = Number(Math.round(value+'e'+decimals)+'e-'+decimals);
		decimals++;
		runs++;
	} while (result==0 && runs<6);
	
    return result;
}