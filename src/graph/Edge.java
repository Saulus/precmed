package graph;

import java.util.HashMap;
import java.util.HashSet;

import configuration.Consts;

public class Edge {
	public Node source;
	public Node target;
	
	
	private HashMap<String,EdgeStatistics> edgeinfo = new HashMap<String,EdgeStatistics>(); //graphname -> info
	
	private HashSet<String> relations = new HashSet<String>();
	
	
	Edge(Node source, Node target) {
		this.source=source;
		this.target=target;
	}
	
	public void addRelation (String relation) {
		relations.add(relation);
		
	}
	
	public void addStatistics (String graphname, double or, double pvalue, double beta, double number_relations, double proportion_of_incidents_have_source, double proportion_source_get_incidents, int mean_age_of_incident_patients_with_condition_source) {
		if (!this.edgeinfo.containsKey(graphname)) {
			edgeinfo.put(graphname,new EdgeStatistics());
		}
		edgeinfo.get(graphname).or=or;
		edgeinfo.get(graphname).pvalue=pvalue;
		edgeinfo.get(graphname).beta=beta;
		edgeinfo.get(graphname).number_relations=number_relations;
		edgeinfo.get(graphname).proportion_of_incidents_have_source=proportion_of_incidents_have_source;
		edgeinfo.get(graphname).proportion_source_get_incidents=proportion_source_get_incidents;
		edgeinfo.get(graphname).mean_age_of_incident_patients_with_condition_source=mean_age_of_incident_patients_with_condition_source;
	}
	
	
	public boolean isIntercept () {
		return source.isIntercept();
	}
	
	public void testSignificance(Edge mirroredEdge) {
		for (String graphname: edgeinfo.keySet()) {
			edgeinfo.get(graphname).isSignificant=(edgeinfo.get(graphname).pvalue<0.05 && edgeinfo.get(graphname).number_relations>=mirroredEdge.getNumber_relations(graphname));  
		}
	}
	
	public double getNumber_relations(String graphname) {
		return edgeinfo.get(graphname).number_relations;
	}
	
	public EdgeStatistics getEdgeStatistics(String graphname) {
		//decide in which statistics to return
		//return nodeinfo.get(graphname);
		return edgeinfo.get(Consts.generalStatisticsGraph);
	}
	
	public double getBeta(String graphname) {
		if (edgeinfo.containsKey(graphname)) return edgeinfo.get(graphname).beta;
		
		return 0;
	}
	
	public boolean isInGraph(String graphname) {
		return edgeinfo.containsKey(graphname);
	}
	
	public boolean isInAnyGraph(HashSet<String> graphnames) {
		for (String n : graphnames) {
			if (isInGraph(n)) return true;
		}
		return false;
	}
	

}
