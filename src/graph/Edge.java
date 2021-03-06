package graph;

import java.util.HashMap;
import java.util.HashSet;

import configuration.Consts;
import lists.NodeLabels;


public class Edge {
	public Node source;
	public Node target;
	
	
	private HashMap<String,EdgeStatistics> edgeinfo = new HashMap<String,EdgeStatistics>(); //graphname -> info
	private boolean bothInSameChapter;
	
	private HashSet<String> relations = new HashSet<String>();
	
	
	Edge(Node source, Node target, NodeLabels nodelabels) {
		this.source=source;
		this.target=target;
		bothInSameChapter=nodelabels.getCluster4Code(source).equals(nodelabels.getCluster4Code(target));
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
		
		/* edge to be filtered out if:
		 * too high odds
		 * in same chapter
		 */
		edgeinfo.get(graphname).isHighOdds=(edgeinfo.get(graphname).or>=Consts.maxOdds);
		
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
		if (edgeinfo.containsKey(graphname)) return edgeinfo.get(graphname).number_relations; 
		return 0;
	}
	
	public EdgeStatistics getEdgeStatistics(String graphname) {
		//decide in which statistics to return
		//CAVE: general graph might not have egdes (yet)
		if (edgeinfo.containsKey(graphname))
			return edgeinfo.get(graphname);
		//return edgeinfo.get(Consts.generalStatisticsGraph);
		return null;
	}
	
	public double getBeta(String graphname) {
		if (edgeinfo.containsKey(graphname)) return edgeinfo.get(graphname).beta;
		
		return 0;
	}
	
	public void setBeta(String graphname, double beta) {
		if (edgeinfo.containsKey(graphname)) edgeinfo.get(graphname).beta=beta;
		
	}
	
	public void setOR(String graphname, double or) {
		if (edgeinfo.containsKey(graphname)) edgeinfo.get(graphname).or=or;
		
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
	
	public boolean filterOut(String graphname) {
		if (edgeinfo.containsKey(graphname) && !this.isIntercept()) return bothInSameChapter && edgeinfo.get(graphname).isHighOdds;
		
		return false;
	}
	

}
