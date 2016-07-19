// INIT

//filter init
var prevalence_min=0, prevalence_max=15;
var age_min=0, age_max=99;

var linkDistance=100,
	friction=0.4,
	charge=-2000,
	chargeDistance=300,
	theta=0.9,
	gravity=0.15;

if (mode=="EXPLORE") {
	linkDistance=100;
	friction=0.5;
	charge=-1000;
	chargeDistance=300;
	theta=0.9;
	gravity=0.2;
}

var DISlist = [];
var MEDlist = [];

var graphdata = null;
var graphnodes = [],
	graphlinks = [],
	nodes = [],
	links = [],
	nodeClickInProgress=false;
var listtree = null;
	
var filtercriteria = {}; //single Criteria: variable: "nodevar", min: 0, max: 100

var number_focused = 0;

$.getJSON( ehealthurl+'Demo', function( jsondata ) {
	$("#demo").attr("max",jsondata);
});

//reset input fields
//Init = Reset
drawUI();
reset(); 

// load("MED","#leftValuesMED"); -->


// LOADER -->
function load(loader,form) {
	var myurlstart=ehealthurl+'Lists'+'?lang='+lang+'&list=';
	
	var myvar = [],
		myurl = [],
		intsort=[];
	
	if (loader=="DIS" || loader=="ALL") {
		myvar.push('DISlist');
		myurl.push(myurlstart+'DIS');
		intsort.push(false);
	}
	if (loader=="MED" || loader=="ALL") {
		myvar.push('MEDlist');
		myurl.push(myurlstart+'MED');
		intsort.push(false);
	}
	
	$(form).find('option').remove();
	
	for (var v = 0; v < myvar.length; v++) {
		if (window[myvar[v]].length == 0) getfromurl(myurl[v],myvar[v],form,intsort[v]);
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

$("#add_DIS").mouseover(function (e) {
	$("#DISselector").css('top', e.clientY-15);
	$("#DISselector").css('left', e.clientX-75);
	$("#DISselector").show();
});

$("#DISselector").mouseleave(function () {
	$("#DISselector").hide();
});

$("#DISselectorX").click(function () {
	$("#DISselector").hide();
});

$("#add_MED").mouseover(function (e) {
	$("#MEDselector").css('top', e.clientY -15);
	$("#MEDselector").css('left', e.clientX-175);
	$("#MEDselector").show();
});

$("#MEDselector").mouseleave(function () {
	$("#MEDselector").hide();
});

$("#MEDselectorX").click(function () {
	$("#MEDselector").hide();
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


$("#searchDIS").on('keyup', function() {
	search("#optionsDIS",$(this).val(),false);
	
	//hack: de-select if only one value is left to enable new select
	//if ($("#optionsDIS option:selected").length == 1) $("#optionsDIS option:selected").first().removeAttr("selected");
});

$("#clearSearchDIS").click(function () {
	clearsearch("#optionsDIS","#searchDIS","DIS");
});

$("#optionsDIS").change(function () {
	move("#optionsDIS","#valuesDIS",false);
});


$("#addDIS").click(function () {
	move("#optionsDIS","#valuesDIS",false);
});

$("#valuesDIS").change(function () {
	clearitem("#valuesDIS");
});

$("#searchMED").on('keyup', function() {
	search("#optionsMED",$(this).val(),false);
	
	//hack: de-select if only one value is left to enable new select
	//if ($("#optionsMED option:selected").length == 1) $("#optionsMED option:selected").first().removeAttr("selected");
});

$("#clearSearchMED").click(function () {
	clearsearch("#optionsMED","#searchMED","MED");
});

$("#optionsMED").change(function () {
	move("#optionsMED","#valuesMED",false);
});

$("#addMED").click(function () {
	move("#optionsMED","#valuesMED",false);
});

$("#valuesMED").change(function () {
	clearitem("#valuesMED");
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
			if (key == "DIS") {addListToForm(value,"DISlist","#valuesDIS",false);}
			else if (key == "MED") {addListToForm(value,"MEDlist","#valuesMED",false);}
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
	postdata.DIS=[];
	$("#valuesDIS option").each( function() {
		postdata.DIS.push($(this).val());
	});
	postdata.COUNT_DIS = postdata.DIS.length;
	postdata.MED=[];
	$("#valuesMED option").each( function() {
		postdata.MED.push($(this).val());
	});
	postdata.COUNT_MED = postdata.MED.length;
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
			var item = '<option value=' + window[globalVarList][i].key + ' title="' + window[globalVarList][i].value.label + '">' + window[globalVarList][i].value.label + '</option>';
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
		$("#valuesDIS").find('option').remove();
		$("#valuesMED").find('option').remove();
		
		clearsearch("#optionsDIS","#searchDIS","DIS");
		clearsearch("#optionsMED","#searchMED","MED");
	} else {
		clearsearch("#optionsEXPLORE","#startEXPLORE","ALL");
	}

	
	d3.selectAll(".chart > *").remove();
	if ($("#nodeoverview").is(':visible')) $( "#nodeoverview" ).toggle( "slide" );
	$('#shownodeoverview').prop('checked', false);
	fillNodesLabelOverview();
	
	
	resetFilter();
	
	graphdata=null;
	graphnodes = [];
	graphlinks = [];
	nodes = [];
	links = [];
	nodeClickInProgress=false;
	listtree = null;
	number_focused=0;
	
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

function initNodes(mynodes,key) {
	//init Nodes:
			//isCurrentlyFocused and hideNode and fixed and position
			var n = mynodes.length,
				width= $("#thegraph").width();
				height= $("#thegraph").height()
			for (var k=0; k< n; k++) {
				mynodes[k].isCurrentlyFocused=false;		
				if (key != null && mynodes[k].key == key ) mynodes[k].isCurrentlyFocused=true;		
				mynodes[k].hideNode=false;
				mynodes[k].fixed = false;
				//order on screen by cluster -> not working for too many and/or unsorted clusters
				//mynodes[k].x = Math.cos((mynodes[k].clusterkey+1) / numberClusters * 2 * Math.PI) * 200 + width / 2 + (Math.random()*10);
				//mynodes[k].y = Math.sin((mynodes[k].clusterkey+1) / numberClusters * 2 * Math.PI) * 200 + height / 2 + (Math.random()*10);
				
				//order diagonally
				//mynodes[k].x = width / n * k;
				//mynodes[k].y = height / n * k;
				
				//order by istarget: old left, new right
				
				if (mynodes[k].istarget) {
					mynodes[k].x = width * 0.7;
					mynodes[k].y = height / n * k;
				} else {
					mynodes[k].x = width * 0.3;
					mynodes[k].y = height / n * k;
				}
				//console.log(mynodes[k].key + " " +mynodes[k].clusterkey + " " + mynodes[k].x + " " + mynodes[k].y);
			}
			
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
	//Init Links
			//...assign node objects to links (instead of array pos)
			//...init scale for opacity
			//..init linkStrength
			// Set the range
			var  v = d3.scale.linear().range([0, 100]);
			// Scale the range of the data
			v.domain([0, d3.max(mylinks, function(d) { return d.oddstransformed; })]);
			
			for (var i=0; i< mylinks.length; i++) {
					if (mylinks[i].source.key) break; //objects already assigned
					sourceNo = mylinks[i].source;
					targetNo = mylinks[i].target;
					mylinks[i].source = mynodes[sourceNo];
					mylinks[i].target = mynodes[targetNo];
					//test existing, and add if new
					if (existingLinks) if (doesLinkExist(mylinks[i],existingLinks) == null) existingLinks.push(mylinks[i]);
					// assign a opaType and directionType per value to encode opacity
					if (v(mylinks[i].oddstransformed) <= 25) {
						mylinks[i].opaType = "twofive";
						mylinks[i].linkStrength = 0.25;
					} else if (v(mylinks[i].oddstransformed) <= 50 && v(mylinks[i].oddstransformed) > 25) {
						mylinks[i].opaType = "fivezero";
						mylinks[i].linkStrength = 0.5;
					} else if (v(mylinks[i].oddstransformed) <= 75 && v(mylinks[i].oddstransformed) > 50) {
						mylinks[i].opaType = "sevenfive";
						mylinks[i].linkStrength = 0.75;
					} else if (v(mylinks[i].oddstransformed) <= 100 && v(mylinks[i].oddstransformed) > 75) {
						mylinks[i].opaType = "onezerozero";
						mylinks[i].linkStrength = 1;
					}
					if (mylinks[i].odds<1) mylinks[i].directionType = "lowers";
					else mylinks[i].directionType = "increases";
			}
}

function selectNodesAndLinksRiskMode() {
	if (graphdata==null) { GO(); return; }
	
	//LIST or GRAPH
	for (lg=0; lg< graphdata.children.length; lg++) {
		if (graphdata.children[lg].key == "LIST") {
			//find correct subtree
			listtree = graphdata.children[lg].children;
			/*for (var i=0; i< graphdata.children[lg].children.length; i++) {
				if (graphdata.children[lg].children[i].key == "ABS") listtree_abs=graphdata.children[lg].children[i].children;
				if (graphdata.children[lg].children[i].key == "REL") listtree_rel=graphdata.children[lg].children[i].children;
			}break;*/
			
			
		} else if (graphdata.children[lg].key == "GRAPH") {
			//find correct subtree
			for (var i=0; i< graphdata.children[lg].children.length; i++) {
						if (graphdata.children[lg].children[i].key == "LINKS") graphlinks=graphdata.children[lg].children[i].children;
						if (graphdata.children[lg].children[i].key == "NODES") graphnodes=graphdata.children[lg].children[i].children;
			}	
			
			initNodes(graphnodes);
			initLinks(graphlinks,graphnodes,null);
			
			nodes=graphnodes;
			links=graphlinks;
		}
	}
}

function selectNodesAndLinksExploreMode(key) {
	if (graphdata==null) { refreshGraphSingle(key); return; }
	
	//select new nodes and links
	for (var i=0; i< graphdata.children.length; i++) {
		if (graphdata.children[i].key == "LINKS") newlinks=graphdata.children[i].children;
		if (graphdata.children[i].key == "NODES") newnodes=graphdata.children[i].children;
	}
	
	//init nodes and add to existing
	initNodes(newnodes,key);	
	//now add to existing nodes and links
	if (graphnodes.length==0) graphnodes=newnodes;
	else {
		for (var i=0; i< newnodes.length; i++) {
			if ((exnode = doesNodeExist(newnodes[i],graphnodes)) == null) graphnodes.push(newnodes[i]); //new node
			else {
				var isfocused = newnodes[i].isCurrentlyFocused;
				newnodes[i]=exnode; //node exists -> replace to find correct links
				if (isfocused) newnodes[i].isCurrentlyFocused=true;
			}
		}
	}
	
	//init links and add to existing 
	initLinks(newlinks,newnodes,graphlinks);
		
	
	nodes=graphnodes;
	links=graphlinks;
}

function doesNodeExist(node,searchnodes) {
	for (var i=0; i<searchnodes.length; i++) {
		if (searchnodes[i].key==node.key) return searchnodes[i];
	}
	return null;
}

function doesLinkExist(link,searchlinks) {
	for (var i=0; i<searchlinks.length; i++) {
		if (searchlinks[i].source.key==link.source.key && searchlinks[i].target.key==link.target.key) return searchlinks[i];
	}
	return null;
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
			drawListGraph("ABS","#chart_left");
			drawListGraph("REL","#chart_right");
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
	
	var force = d3.layout.force()
		.nodes(nodes)
		.links(links)
		.size([width, height])
		.linkDistance(linkDistance)
		.linkStrength(function(d){return d.linkStrength})
		.friction(friction)
		.charge(charge)
		.chargeDistance(chargeDistance)
		.theta(theta)
		.gravity(gravity)
		.on("tick", tick)
		.on("end", fixAll)
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
	 //First: Link group
	var all_links = chart.select(".all_links");
	 if (all_links.empty()) all_links = chart.append("g").attr("class", "all_links");
    var path = all_links.selectAll("path.link").data(links).attr("class", function(d) { return "link " + d.typekey + " " + d.opaType + " " +d.directionType; });
	// Enter any new links
	path.enter().insert("svg:path")
		.attr("class", function(d) { return "link " + d.typekey + " " + d.opaType + " " +d.directionType; })
		.attr("marker-end", "url(#end)")
		.on("mousemove", mousemoveTooltipLink)
          .on("mouseout", mouseoutTooltip);
	// Exit any old links.
    path.exit().remove();

	// Update the nodes
	var all_nodes = chart.select(".all_nodes");
	 if (all_nodes.empty()) all_nodes = chart.append("g").attr("class", "all_nodes");
	var node = all_nodes.selectAll(".nodes")
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
				if (d.key=="COUNT_MED") return "Anzahl MED"; 
				if (d.key=="COUNT_DIS") return "Anzahl DIS"; 
				} return d.key; 
		});
	// Exit any old nodes.
    node.exit().remove();
	
	// add the curvy lines
	function tick() {
		node
			.attr("transform", function(d) { 
				d.x = Math.max(d.radius, Math.min(width - d.radius, d.x)); //set boundary
				d.y = Math.max(d.radius, Math.min(height - d.radius, d.y));
				return "translate(" + d.x + "," + d.y + ")"; });
		
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
	}
	
	/*
	function tick() {
		path.attr("points", function(d) {
		  return d.source.x + "," + d.source.y + " " + 
				 (d.source.x + d.target.x)/2 + "," + (d.source.y + d.target.y)/2 + " " +
				 d.target.x + "," + d.target.y; });
			node
				.attr("transform", function(d) { 
					return "translate(" + d.x + "," + d.y + ")"; });
	}*/
	
	function fixAll() {
		/*
		//in the end: fix all nodes
		for (var i=0; i< nodes.length; i++) {
			nodes[i].fixed = true;
		}
		*/
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
	
	sortednodes=sortArray(nodes,false);
	for (var i = 0; i < sortednodes.length; i++) {
		var thislist = "#nodeULEx1";
		if (sortednodes[i].istarget && sortednodes[i].typekey=="DIS") thislist = "#nodeULPred1";
		if (sortednodes[i].istarget && sortednodes[i].typekey=="MED") thislist = "#nodeULPred2";	
		if (!sortednodes[i].istarget && sortednodes[i].typekey=="MED") thislist = "#nodeULEx2";	
		$(thislist).append('<li class="nodeLI" style="color:'+selectNodesColor(sortednodes[i])+';"><span>'+sortednodes[i].label+'</span></li>');
	}
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
	
	$('input[name=topX]', '#view_form').filter('[value=5]').prop('checked', true);
	
	$( "#thresholdslider" ).slider( "value",0);
	$( "#threshold" ).val(">= " + $( "#thresholdslider" ).slider( "value")+ "%");
	
	$("input[name='nodetypes']").each( function () {$(this).prop('checked', true); });
	
	$('input[name=linkdepth]', '#config_form').filter('[value=DIRECT]').prop('checked', true);
	
	filtercriteria = {};

}

function resetHidden() {
	for (var i = 0; i < graphnodes.length ; i++) {
		graphnodes[i].hideNode=false;
		//graphnodes[i].fixed = false;
	}
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
	var modus= $('input[name=linkdepth]:checked', '#config_form').val();
	if (exploreMode) {
		if (focusedOnly && modus != "ALL") 
			return (link.target.isCurrentlyFocused || link.source.isCurrentlyFocused);
		else return true;
	} else {
		var isfine = true;
		if (modus != "ALL") 
			isfine = (!link.source.istarget && link.target.istarget);
		if (focusedOnly) 
			isfine = isfine && (link.target.isCurrentlyFocused || link.source.isCurrentlyFocused);
		return isfine ;
	}
	
	
	if (modus == "CONNECTED" && number_focused>=2) { //not used, for explore mode
		isfine = link.target.isCurrentlyFocused && link.source.isCurrentlyFocused;
	}
	return isfine;
}

function filterNodes(){
    // we'll keep only the data where filterned nodes are the source or target
    var newNodes = [];
    var newLinks = [];
	var newLinks2 = [];

	//first: check for selected
    for (var i = 0; i < graphlinks.length ; i++) {
        var link = graphlinks[i];
        if (showLink(link,mode=="EXPLORE",true)) newLinks.push(link);
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
        if (targetOK && sourceOK && showLink(link,mode=="EXPLORE",false))
			newLinks2.push(link);
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


// List-Graph --> 
function drawListGraph(type_pos,chartid) {
	
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
		kx_top_width = 0.15; 
		kx_middle_width = 0.3; 
		kx_last_width = 0.55; 
		
	//console.log(subtree);
	var partition = d3.layout.partition()
	    .value(function(d) { return type_pos == "ABS" ? d.risk : d.rrisk; })
		.sort(null);

	// d3.json(JSON_FILE, function(root) {
	  var g = chart.selectAll("g")
	      .data(partition.nodes(subtree))
	    .enter().append("svg:g")
	      .attr("transform", function(d) { 
				if (d.key==type_pos) return "translate(" + x(d.y) + "," + y(d.x) + ")";
				if (d.children) return "translate(" + x(kx_top_width) + "," + y(d.x) + ")";
				return "translate(" + x(kx_top_width + kx_middle_width) + "," + y(d.x) + ")"; })
				/*return d.children ? 
				"translate(" + x(d.y/kx_child_faktor) + "," + y(d.x) + ")"
				: "translate(" + x(d.y/kx_child_faktor) + "," + y(d.x) + ")"; })*/
		.on("mousemove", mousemoveTooltipNode)
          .on("mouseout", mouseoutTooltip)
		  .on("dblclick", click_link);

	  var kx = w,
	      ky = h / 1;

	  g.append("svg:rect")
	      .attr("width", function(d) { 
				if (d.key==type_pos) return kx * kx_top_width;
				if (d.children) return kx * kx_middle_width; 
				return kx * kx_last_width })
		  /*
		  return d.children ? 
					kx * d.dy / kx_child_faktor :
					kx * d.dy * kx_child_faktor })*/
	      .attr("height", function(d) { return d.dx * ky; })
	      .attr("class", function(d) { return d.children ? "parent" : "child"; })
		  .attr("fill",function(d) { 
					if (!d.children && (!d.isnew || toBeFilteredOut(d)))  return "#eee";
					if (d.children) {
						if (d.key == "DIS" || d.key == "MED" || d.key == "ABS" || d.key == "REL") return "#eee";
						else if (d.key == "SERIOUS") return color["GEN"](d.key);
						else return color["DIS"](d.key);
					} else return color[d.typekey](d.clusterkey);
				});

	  g.append("svg:text")
	      .attr("transform", transform)
	      .attr("width", function(d) { 
				if (d.key==type_pos) return kx * kx_top_width;
				if (d.children) return kx * kx_middle_width; 
				return kx * kx_last_width })
		  /*return d.children ? 
					kx * d.dy / kx_child_faktor :
					kx * d.dy * kx_child_faktor })*/
		  .attr("height", function(d) { return d.dx * ky; })
		  .attr("x", ".35em")
		  .attr("dy", ".1em")
		  .attr("class", function(d) { return d.children ? "parent" : "child"; })
		  /*.attr("fill",function(d) { 
					if (!d.children && !d.isnew) return "#353535";
				})*/
	      .style("opacity", function(d) { return d.dx * ky > 12 ? 1 : 0; })
	      .text(function(d) { return d.children ?  d.label : type_pos == "ABS" ? d.label + ", Risk: " + d.risk : d.label + ", rel. Risk: " + d.rrisk; })
		  .call(wrap);
	 function transform(d) {
	    return "translate(8," + d.dx * ky / 2 + ")";
	  }
	  

			  
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
 //TOOLTIP functions
 	var mousemoveTooltipNode = function(d) {
	  var mytext="";
	  if (d.label) mytext=d.label; else mytext=d.key;
	   if (!d.istarget && !d.children && mode=="RISKS") mytext=mytext + " (existing)";
	  d3.select("#tooltip #t_heading")
			.text(mytext);

	  if (d.children) {
		  d3.select("#tooltip #t_type")
			.text(null);
			//.text("* statistical clusters are beta");
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
		  /*d3.select("#tooltip #t_type")
			.html("<td width=50>Type:</td><td>" +  d.typelabel+"</td>");*/
			d3.select("#tooltip #t_type")
			.text(null);
			d3.select("#tooltip #t_cluster")
			.html("<td width=80>Group:</td><td>" +  d.clusterlabel+"</td>");
			if (mode=="RISKS") {
			  d3.select("#tooltip #t_absrisk")
				.html("<td>Abs. Risk:</td><td>" +round(d.risk * 100,1) + "%"+"</td>");
			  d3.select("#tooltip #t_relrisk")
				.html("<td>Rel. Risk:</td><td>" + d.rrisk+"</td>");
			}
			else { 
				d3.select("#tooltip #t_absrisk")
				.text(null);
				d3.select("#tooltip #t_relrisk")
				.text(null);
			}
		  d3.select("#tooltip #t_prev")
			.html("<td>Prevalence:</td><td>" + round(d.prevalence * 100,1)+ "%"+"</td>");
			if (d.typekey == "DIS") {
			  d3.select("#tooltip #t_inc")
				.html("<td>Incidence:</td><td>" + round(d.incidence * 100,1)+ "%"+"</td>");
			  d3.select("#tooltip #t_mean_age")
				.html("<td>Mean Age of incidents:</td><td>" + d.mean_age+"</td>");
			  d3.select("#tooltip #t_link")
				.html("<td colspan=2>Double-click for ClinicalKey Content</td>");
			} else {
				d3.select("#tooltip #t_inc")
				.text(null);
				d3.select("#tooltip #t_mean_age")
				.text(null);
				d3.select("#tooltip #t_link")
				.text(null);
			}
	 }
	 
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
		
	};
	
	var mousemoveTooltipLink = function(d) {
	  d3.select("#tooltip #t_heading")
			.text(d.source.key + " to " + d.target.key);
	  d3.select("#tooltip #t_type")
			.html("<td width=80>Type:</td><td>" +  d.typelabel+"</td>");
		d3.select("#tooltip #t_cluster")
			.text(null);
		d3.select("#tooltip #t_absrisk")
			.html("<td>Odds Ratio:</td><td>" + d.odds+"</td>");
		  d3.select("#tooltip #t_relrisk")
			.text(null);
		  d3.select("#tooltip #t_prev")
			.text(null);
		 d3.select("#tooltip #t_inc")
			.html("<td>Incidence:</td><td>" + round(d.incidence* 100,2)+"%"+"</td>");
		  d3.select("#tooltip #t_mean_age")
			.html("<td>Mean Age:</td><td>" + d.mean_age+"</td>");
		  d3.select("#tooltip #t_link")
			.text(null);
			
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