package graph;

import java.util.Collection;
import java.util.HashMap;

public class NodeList {
	private HashMap<String,Node> nodes = new HashMap<String,Node>();
	
	public NodeList () {
	}
	
		
	
	public void addNode(String readable_code, String alternative_code) {
		String code=Node.decideCode(readable_code,alternative_code);
		if (!nodes.containsKey(code)) {
			Node n = new Node(readable_code,alternative_code);
			nodes.put(code,n);
		} 
	}
	
	public void addNode(String readable_code, String alternative_code, String graphname, double prevalence, double incidence, int mean_age_incidence, int mean_age_prevalence) {
		String code=Node.decideCode(readable_code,alternative_code);
		if (!nodes.containsKey(code)) {
			Node n = new Node(readable_code,alternative_code);
			nodes.put(code,n);
		}
		nodes.get(code).addStatistics(graphname,prevalence,incidence,mean_age_incidence,mean_age_prevalence);
	}
	
	
	public boolean nodeExists(String code) {
		return nodes.containsKey(code);
	}
	
	public Node getNode(String code) {
		if (!this.nodeExists(code)) this.addNode(code, "");
		return nodes.get(code);
	}
	
	public Node getNode(String readable_code, String alternative_code) {
		String code=Node.decideCode(readable_code,alternative_code);
		if (!this.nodeExists(code)) this.addNode(readable_code, alternative_code);
		return nodes.get(code);
	}
	
	public Collection<Node> getAllNodes() {
		return this.nodes.values();
	}

}
