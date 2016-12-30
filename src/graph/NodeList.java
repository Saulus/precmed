package graph;

import java.util.Collection;
import java.util.HashMap;

public class NodeList {
	private HashMap<String,Node> nodes = new HashMap<String,Node>();
	private HashMap<String,Node> nodes_by_alternative_code = new HashMap<String,Node>();
	
	public NodeList () {
	}
	
		
	
	public Node addNode(String readable_code, String alternative_code) {
		Node exists=null;
		if (!readable_code.isEmpty() && nodes.containsKey(readable_code)) {
			exists=nodes.get(readable_code);
			if (!alternative_code.isEmpty() && !nodes_by_alternative_code.containsKey(alternative_code)) {
				exists.setAltCode(alternative_code);
				nodes_by_alternative_code.put(alternative_code, exists);
			}
			return exists;
		}
		if (!alternative_code.isEmpty() && nodes_by_alternative_code.containsKey(alternative_code) && nodes_by_alternative_code.get(alternative_code).getCode().isEmpty()) {
			exists=nodes_by_alternative_code.get(alternative_code);
			if (!readable_code.isEmpty() && !nodes.containsKey(readable_code)) {
				exists.setCode(readable_code);
				nodes.put(readable_code, exists);
			}
			return exists;
		}
		exists = new Node(readable_code,alternative_code);
		nodes.put(readable_code,exists);
		nodes_by_alternative_code.put(alternative_code, exists);
		return exists;
	}
	
	public void addNode(String readable_code, String alternative_code, String graphname, double prevalence, double incidence, int mean_age_incidence, int mean_age_prevalence) {
		Node node = addNode(readable_code,alternative_code);
		node.addStatistics(graphname,prevalence,incidence,mean_age_incidence,mean_age_prevalence);
	}
	
	
	public boolean nodeExists(String code) {
		if (nodes.containsKey(code)) return true;
		if (nodes_by_alternative_code.containsKey(code)) return true;
		return false;
	}
	
	public Node getNode(String code) {
		if (nodes.containsKey(code)) return nodes.get(code);
		if (nodes_by_alternative_code.containsKey(code)) return nodes_by_alternative_code.get(code);
		return null;
	}
	
	public Node getNodeOrAdd(String readable_code, String alternative_code) {
		return this.addNode(readable_code, alternative_code);
	}
	
	public Collection<Node> getAllNodes() {
		return this.nodes.values();
	}

}
