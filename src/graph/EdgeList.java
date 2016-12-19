package graph;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Set;



public class EdgeList {
	private HashMap<Node,HashMap<Node,Edge>> edges_target_source = new HashMap<Node,HashMap<Node,Edge>>();
	private HashMap<Node,HashMap<Node,Edge>> edges_source_target = new HashMap<Node,HashMap<Node,Edge>>();
	
	private HashMap<Node,HashMap<String,HashSet<Node>>> source_relation_target = new HashMap<Node,HashMap<String,HashSet<Node>>>(); 
		
	
	private Node interceptnode;
	
	public EdgeList () {
	}
	
		
	public void testSignificance() {
			Edge direction1;
			Edge direction2;
			for (Node target : edges_target_source.keySet()) 
				for (Node source : edges_target_source.get(target).keySet()) {
					direction1=edges_target_source.get(target).get(source);
					if (edges_source_target.containsKey(target) &&
							edges_source_target.get(target).containsKey(source)) {
						direction2=edges_source_target.get(target).get(source);
						direction1.testSignificance(direction2);
						direction2.testSignificance(direction1);
					}
					else direction1.testSignificance(direction1);
			}
	}
	
	public void addEdge(String relation,Node source, Node target) {
		//Target -> Source
		if (!edges_target_source.containsKey(target))
			edges_target_source.put(target, new HashMap<Node,Edge>());
		if (!edges_target_source.get(target).containsKey(source)) 
			edges_target_source.get(target).put(source, new Edge(source,target));
		
		Edge edge =  edges_target_source.get(target).get(source);
		
		//Source -> Target
		if (!edges_source_target.containsKey(source))
			edges_source_target.put(source, new HashMap<Node,Edge>());
		if (!edges_source_target.get(source).containsKey(target)) 
			edges_source_target.get(source).put(target, edge);
		
		
		edge.addRelation(relation);
		
		
		if (!source_relation_target.containsKey(source)) source_relation_target.put(source, new HashMap<String,HashSet<Node>>());
		if (!source_relation_target.get(source).containsKey(relation)) source_relation_target.get(source).put(relation, new HashSet<Node>());
		source_relation_target.get(source).get(relation).add(target);
	}
	
	
	//adds edge if not present
	public void addEdge(String relation,Node source, Node target, String graphname, double or,double beta,double pvalue,double number_relations,double proportion_of_incidents_have_source,double proportion_source_get_incidents,int mean_age_of_incident_patients_with_condition_source) {
		this.addEdge(relation,source, target);
		Edge e = edges_target_source.get(target).get(source);
		e.addStatistics(graphname, or, pvalue, beta, number_relations, proportion_of_incidents_have_source, proportion_source_get_incidents, mean_age_of_incident_patients_with_condition_source);
	
	}
	
	
	public boolean nodeIsTarget (Node node) {
		return (edges_target_source.containsKey(node));
	}
	
	public Set<Node> getAllTargets() {
		return edges_target_source.keySet();
	}
	
	public double getRisk4Target(Node target, HashMap<Node,Double> features, String graphname) {
			double coeffs;
			if (edges_target_source.get(target).containsKey(interceptnode))
				coeffs = edges_target_source.get(target).get(interceptnode).getBeta(graphname); //Math.log(targetlist.get(target).get(Consts.intercept).or);
			else coeffs=0.;
			for (Node feature : features.keySet()) {
				if (edges_target_source.get(target).containsKey(feature))
					coeffs += features.get(feature) * edges_target_source.get(target).get(feature).getBeta(graphname); // Math.log(targetlist.get(target).get(feature).or); 
			}
			double odds = Math.exp(coeffs);
			double prob = odds / (1+odds);
			return prob;
	}
	
	
	
	public HashSet<Node> getConnectedNodes(Node sourcenode) {
		HashSet<Node> nodes = new HashSet<Node>();
		
		if (edges_source_target.containsKey(sourcenode))
				nodes.addAll(edges_source_target.get(sourcenode).keySet());
		
		if (edges_target_source.containsKey(sourcenode))
				nodes.addAll(edges_target_source.get(sourcenode).keySet());
		
		nodes.remove(this.interceptnode);
		
		//ArrayList<Node> nodes2 = new ArrayList<Node>(nodes);
		
		return nodes;
	}
	
	public HashMap<String,HashSet<Node>> getTargetNodesByRelation(Node sourcenode) {
		if (source_relation_target.containsKey(sourcenode))
			return source_relation_target.get(sourcenode);
		return new HashMap<String,HashSet<Node>>();
	}
	
	
	public boolean hasEdge (String graphname, Node source, Node target) {
		if (edges_target_source.containsKey(target) && 
					edges_target_source.get(target).containsKey(source) &&
					edges_target_source.get(target).get(source).isInGraph(graphname)) return true;
		return false;
	}
	
	public Edge getEdge (Node source, Node target) {
		if (edges_target_source.containsKey(target) && 
					edges_target_source.get(target).containsKey(source)) return edges_target_source.get(target).get(source);
		return null;
	}
	
	
	public void setInterceptNode(Node n) {
		this.interceptnode=n;
	}

}
