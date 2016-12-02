	var ehealthurl = 'http://localhost:8080/PrecisionMedicine/';
	//var ehealthurl = window.location.protocol + "//" + window.location.host +  "/PrecisionMedicine/";
	
	var graphhurl = ehealthurl + "explore.html"; //window.location.protocol + "//" + window.location.host +  "/graph/";
	
	//var topX = 10;
	
	var demo_patient = 15;
	
	var nodeminradius = 12;
	var nodemaxradius = 24;
	
	var numberClusters=22;

	var color = {
	"ICD": d3.scaleOrdinal().domain(["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI","XXII",""]).range(["#999590","#999092","#999991","#999272","#996949","#993929","#991819","#999599","red","#999092","#999969","#998939","#916913"]),
	"ATC": d3.scaleOrdinal().domain(["","A","B","C","D","G","H","J","L","M","N","P","R","S","V"]).range(["#f7fbff","#deebf7","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5"]),
	"GEN": d3.scaleOrdinal().domain(["SERIOUS","INPUT"]).range(["darkred","darkgrey"]),
	"ICG": d3.scaleOrdinal().domain(["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI","XXII",""]).range(["#999590","#999092","#999991","#999272","#996949","#993929","#991819","#999599","red","#999092","#999969","#998939","#916913"])
	}

	
	/*var color = {
	"DIS": d3.scale.ordinal().domain(["","5","0","1","4","3","2"]).range(["#fff5f0","#fee0d2","#fcbba1","#fc9272","#fb6a4a","#ef3b2c","#cb181d"]),
	"MED": d3.scale.ordinal().domain(["","5","0","1","4","3","2"]).range(["#f7fbff","#deebf7","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5"])
	}*/
	var colorNodes = {
	  "ICD": d3.scaleOrdinal().domain(["OLD","NEW"]).range(["#ffaaaa","#990000"]),
	  "ATC": d3.scaleOrdinal().domain(["OLD","NEW"]).range(["#aaddff","#0033cc"]),
	  "GEN": d3.scaleOrdinal().domain(["OLD","NEW"]).range(["#aaa","#000"]),
	  "": d3.scaleOrdinal().domain(["OLD","NEW"]).range(["#aaa","#000"])
	}
	
    //.range(["#E14705","#F87301","#F87301", "#ED5F03", "#E14705","#F87301", "#ED5F03", "#E14705"]);
	
		
	//var color = d3.scale.category20b();
	