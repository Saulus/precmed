package graph;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;

import configuration.Consts;
import lists.ClusterLabels;
import lists.NodeLabels;



/*
 * Interface class
 */
public class CreateResult {
	private NodeLabels nodelabels; 
	private ClusterLabels clusterlabels; 
	private EdgeList edges;
	private NodeList nodes;
	
	List<OnlineNode> existing = new ArrayList<OnlineNode>();
	List<OnlineNode> risks = new ArrayList<OnlineNode>();
	List<OnlineNode> risks_relative = new ArrayList<OnlineNode>();
	
	HashMap<String,HashMap<OnlineNode,List<OnlineNode>>> other_relations = new HashMap<String,HashMap<OnlineNode,List<OnlineNode>>>();
	
	
	class OnlineNode {
		public String key;
		public String label;
		public double risk = 0; //absolute risk: KNR , KH
		public double rrisk = 0; //relative risk
		//public double auc = 0;
		public double prevalence = 0;
		public double incidence = 0;
		public double mean_age = 0;
		public String clusterkey="";
		public String clusterlabel;
		public String typekey="";
		public String typelabel;
		public boolean isnew = true;
		public boolean istarget = true;
		public int topX = 0;
		
		public OnlineNode() {	
		}
		
		public void roundMe () {
				risk = (double) Math.round(risk*10000)/10000;
				if (rrisk != 0) rrisk = (double) Math.round(rrisk*100)/100;
				//if (prevalence != 0) prevalence = (double) Math.round(prevalence*10000)/10000;
				//if (incidence != 0) incidence = (double) Math.round(incidence*10000)/10000;
				if (mean_age != 0) mean_age = (double) Math.round(mean_age*10)/10;
		}
	}
	
	class AbsComp implements Comparator<OnlineNode>{
	    @Override
	    public int compare(OnlineNode e1, OnlineNode e2) {
	    	if(e2.risk > e1.risk) return 1;
	    	if(e2.risk < e1.risk) return -1;
	        return 0;
	    }
	}

	
	class RelComp implements Comparator<OnlineNode>{
	    @Override
	    public int compare(OnlineNode e1, OnlineNode e2) {
	    	if(e2.rrisk > e1.rrisk) return 1;
	    	if(e2.rrisk < e1.rrisk) return -1;
	        return 0;
	    }
	}
	
	class LabelComp implements Comparator<OnlineNode>{
	    @Override
	    public int compare(OnlineNode e1, OnlineNode e2) {
	    	return e1.label.compareToIgnoreCase(e2.label);
	    }
	}
	
	
	class LinkResult {
		public int source;
		public int target;
		public double odds;
		public double pvalue;
		public double proportion_source_get_incidents;
		public double mean_age;
		public boolean isSignificant;
		public String typekey="";
		public String typelabel;
		
		public LinkResult() {	
		}
		
		public void roundMe () {
			odds = (double) Math.round(odds*1000000)/1000000;
			if (pvalue != 0) pvalue = (double) Math.round(pvalue*10000)/10000;
			//if (incidence != 0) incidence = (double) Math.round(incidence*10000)/10000;
			if (mean_age != 0) mean_age = (double) Math.round(mean_age*10)/10;
			if (proportion_source_get_incidents != 0) proportion_source_get_incidents = (double) Math.round(proportion_source_get_incidents*1000)/1000;
		}
	}
	
	
	public CreateResult (NodeList nodes,EdgeList edges,NodeLabels nodelabels,ClusterLabels clusterlabels ) {
		this.nodes = nodes;
		this.edges = edges;
		this.nodelabels = nodelabels;
		this.clusterlabels = clusterlabels;
	}
	
	
	private void addRisks2Result (HashMap<Node,Double> features, Node targetnode, OnlineNode targetresult) {
		targetresult.risk=this.edges.getRisk4Target(targetnode, features);
		if (targetresult.risk < 0.01) targetresult.risk = 0; //basically: exclude risks <1%
		else {
			//double baserisk = graph.getRisk(key, baseriskfeatures);
			//if (baserisk==0.) baserisk =result.incidence;
			//result.rrisk=result.risk/baserisk;
			targetresult.rrisk=targetresult.risk/targetresult.incidence; //CAVE: currently calculated like this... to be discussed!
		}
	}

	
	private OnlineNode populateNode (Node node, boolean istarget, boolean english) {
		OnlineNode result = new OnlineNode();
		result.key=node.getCode();
		result.prevalence=node.getPrevalence();
		result.incidence=node.getIncidence();
		result.mean_age=node.getMean_age_incidence();
		result.istarget=istarget;
		
		
		result.typekey=nodelabels.getType4Code(node.getCode());
		result.clusterkey=nodelabels.getCluster4Code(node.getCode());
		result.label=nodelabels.getLabel4Code(node.getCode(), english);
		result.typelabel=clusterlabels.getLabel4Code(result.typekey, english);
		result.clusterlabel=clusterlabels.getLabel4Code(result.clusterkey, english);
		
		return result;
	}
	
	private OnlineNode populateNodeOtherRelation (String relation, Node node, boolean english, boolean isnew) {
		OnlineNode othernode = new OnlineNode();
		othernode.key=node.getCode();
		othernode.label=nodelabels.getLabel4Code(node.getCode(), english);
		othernode.typekey=nodelabels.getType4Code(node.getCode());
		if (othernode.typekey.equals(""))  othernode.typekey= relation;
		othernode.typelabel=clusterlabels.getLabel4Code(othernode.typekey, english);
		othernode.isnew=isnew;
		
		return othernode;
	}
	
	
	public void createNodes(HashMap<Node,Double> features,  HashMap<Node,Double> baseriskfeatures, boolean english, int topX) {
		OnlineNode onlinenode;
		
		//collect info for source-nodes (which cannot be targets as graph models are incident only)
		for (Node feature : features.keySet()) {
			onlinenode = populateNode(feature,false,english);
			onlinenode.isnew=false;
			onlinenode.roundMe();
			existing.add(onlinenode); 
		}
		
		//now targets
		for (Node target : nodes.getAllNodes()) {
			if (this.edges.nodeIsTarget(Consts.riskRelationName, target) && !features.containsKey(target)) {
				//only new diseases and treatments (as graph models are build like that!)
				onlinenode = populateNode(target,true,english);	
				addRisks2Result(features,target,onlinenode);
				onlinenode.roundMe();
				risks.add(onlinenode);
			}
		}

		//sort and limit
		risks_relative = new ArrayList<OnlineNode>(risks);
		Collections.sort(risks, new AbsComp());
		Collections.sort(risks_relative, new RelComp());
		
		risks =  risks.subList(0, topX);
		for (int i=0; i<risks.size(); i++) risks.get(i).topX=i;
		risks_relative = risks_relative.subList(0, topX);
		for (int i=0; i<risks_relative.size(); i++) risks_relative.get(i).topX=i;
		
		boolean isnew=true;
		//add other relations
		for (String relation : edges.getAllRelations()) {
			if (!relation.equals(Consts.riskRelationName)) {
				other_relations.put(relation, new HashMap<OnlineNode,List<OnlineNode>>());
				for (OnlineNode risknode: risks) {
					if (!other_relations.get(relation).containsKey(risknode)) {
						other_relations.get(relation).put(risknode, new ArrayList<OnlineNode>());
						for (Node node : edges.getTargetNodes(relation, nodes.getNode(risknode.key))) {
							isnew=!(features.containsKey(node) || 
										(features.get(nodes.getNode(Consts.geschlechtattribute))>0 && node.getCode().equals(Consts.maleCUI)) ||
										(features.get(nodes.getNode(Consts.geschlechtattribute))==0 && node.getCode().equals(Consts.femaleCUI))
								);
							other_relations.get(relation).get(risknode).add(
									populateNodeOtherRelation(relation,node,english,isnew)
								);
						}
					}
				}
				for (OnlineNode risknode: risks_relative) {
					if (!other_relations.get(relation).containsKey(risknode)) {
						other_relations.get(relation).put(risknode, new ArrayList<OnlineNode>());
						for (Node node : edges.getTargetNodes(relation, nodes.getNode(risknode.key))) {
							isnew=!(features.containsKey(node) || 
									(features.get(nodes.getNode(Consts.geschlechtattribute))>0 && node.getCode().equals(Consts.maleCUI)) ||
									(features.get(nodes.getNode(Consts.geschlechtattribute))==0 && node.getCode().equals(Consts.femaleCUI))
							);
							other_relations.get(relation).get(risknode).add(
									populateNodeOtherRelation(relation,node,english,isnew)
								);
						}
					}
				}
				//sort Lists
				for (OnlineNode risknode: other_relations.get(relation).keySet()) {
					other_relations.get(relation).get(risknode).sort(new LabelComp());
				}
			}
		}
	}
	
	public TreeNode listNode(boolean english) {
		//create Node structure
		TreeNode newresult = new TreeNode("LIST","List");
		TreeNode rel;
		TreeNode abs;
		if (english) {
			rel = new TreeNode("REL","Relative");
			abs = new TreeNode("ABS","Absolute");
		} else {
			rel = new TreeNode("REL","Relativ");
			abs = new TreeNode("ABS","Absolut");
		}
		newresult.add(rel);
		newresult.add(abs);
		//has_successor
		
		unravelRiskNodes(rel,risks_relative,english);
		unravelRiskNodes(abs,risks,english);
		return newresult;
	}
	
	private void unravelRiskNodes (TreeNode root, List<OnlineNode> risklist, boolean english) {
		TreeNode node ;
		TreeNode subnode_risks;
		TreeNode subnode_other;
		for (OnlineNode risk: risklist) {
			node = new TreeNode(risk.key,risk.label);
			subnode_risks = new TreeNode(Consts.riskRelationName,clusterlabels.getLabel4Code(Consts.riskRelationName, english));
			subnode_risks.add(risk);
			node.add(subnode_risks);
			
			for (String relation : other_relations.keySet()) {
				subnode_other= new TreeNode(relation,clusterlabels.getLabel4Code(relation, english));
				subnode_other.addAll(other_relations.get(relation).get(risk));
				node.add(subnode_other);
			}
			root.add(node);
		}
	}
	
	public TreeNode graphNode(boolean english) {
		TreeNode newresult = new TreeNode("GRAPH","Graph");

		//add nodes
		HashSet<OnlineNode> combresults = new HashSet<OnlineNode>(existing); //use HashSet to add a node only once
		
		combresults.addAll(existing);
		combresults.addAll(risks);
		combresults.addAll(risks_relative);
		//ToDo: Re-Include other relations
		/*
		for (String relation : other_relations.keySet())
			for (List<OnlineNode>l : other_relations.get(relation).values())
				combresults.addAll(l);*/
		
		TreeNode nodetree = new TreeNode("NODES","Nodes");
		nodetree.addAll(combresults);
		newresult.add(nodetree);
				
		//add links
		TreeNode linktree = constructTreeLinks(nodetree,"LINKS","Links",english);
		newresult.add(linktree);
		
		return newresult;
	}
	
	
	public TreeNode constructTreeLinks(TreeNode nodetree, String typekey, String typelabel, boolean english) {
		TreeNode newlinks = new TreeNode(typekey,typelabel); 
		//now links -> for all nodes (with each other)
		LinkResult link;
		for (Object r1 : nodetree.getChildren()) {
			String source = ((OnlineNode) r1).key;
			for (Object r2 : nodetree.getChildren()) {
				String target = ((OnlineNode) r2).key;
				if (edges.hasEdge(nodes.getNode(source), nodes.getNode(target),Consts.riskRelationName)) { //ToDo remove "Consts.riskRelationName" -> would re-include other relations
					for (Edge e : edges.getEdges(nodes.getNode(source), nodes.getNode(target))) {
						link = new LinkResult();
						link.source=nodetree.getChildId(r1);
						link.target=nodetree.getChildId(r2);
						link.odds=e.or;
						link.proportion_source_get_incidents=e.proportion_source_get_incidents;
						link.mean_age=e.mean_age_of_incident_patients_with_condition_source;
						link.pvalue=e.pvalue;
						link.isSignificant=e.isSignificant;
						link.typekey=e.relation;
						link.typelabel=clusterlabels.getLabel4Code(e.relation, english);
						link.roundMe();
						newlinks.add(link);
					}
				}
			}
		}
		return newlinks;
	}
	
	
	public void calcSingleNodeList(String key, boolean english) {
		OnlineNode onlinenode;
		
		//first: single node
		onlinenode = populateNode(nodes.getNode(key),true,english);
		onlinenode.roundMe();
		existing.add(onlinenode); 
		
		ArrayList<Node> connectedNodes = edges.getConnectedNodes(nodes.getNode(key), Consts.riskRelationName); //ToDo: remove Consts.riskRelationName -> includes all relations
		//collect info for source-nodes (which cannot be targets as graph models are incident only)
		for (Node node : connectedNodes) {
			onlinenode = populateNode(node,false,english);
			onlinenode.roundMe();
			existing.add(onlinenode); 
		}
	}

	
	
	public TreeNode singleNode(boolean english) {
		TreeNode newresult = new TreeNode("GRAPH","Graph");
		TreeNode nodetree = new TreeNode("NODES","Nodes");
		nodetree.addAll(existing);
		newresult.add(nodetree);

		TreeNode linktree = constructTreeLinks(nodetree,"LINKS","Links",english);
		newresult.add(linktree);
		
		return newresult;
	}
	
	
	
	
}
