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
	protected NodeLabels nodelabels; 
	protected ClusterLabels clusterlabels; 
	protected MedicalGraph graph;
	protected String riskgraph;
	protected HashSet<String> othergraphs;
	
	boolean hasRiskGraph = false;
	
	HashMap<Node,Double> features;
	List<OnlineNode> feature_nodes = new ArrayList<OnlineNode>();
	List<OnlineNode> risks = new ArrayList<OnlineNode>();
	List<OnlineNode> risks_relative = new ArrayList<OnlineNode>();
	HashSet<OnlineNode> othernodes = new HashSet<OnlineNode>();
	
	
	class OnlineNode {
		public String key;
		public String label;
		public double risk = 1; //absolute risk: KNR , KH
		public double rrisk = 1; //relative risk
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
	
	/*
	 * sort:
	 *    if rel-risk < 1: move to back
	 *    if risk<risk: move to back
	 */
	class AbsComp implements Comparator<OnlineNode>{
	    @Override
	    public int compare(OnlineNode e1, OnlineNode e2) {
	    	if(e2.rrisk>1 && e1.rrisk<=1) return 1; 
	    	if(e1.rrisk>1 && e2.rrisk<=1) return -1;
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
		public String source;
		public String target;
		public double odds;
		public double beta;
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
			beta = (double) Math.round(beta*10000)/10000;
			if (pvalue != 0) pvalue = (double) Math.round(pvalue*10000)/10000;
			//if (incidence != 0) incidence = (double) Math.round(incidence*10000)/10000;
			if (mean_age != 0) mean_age = (double) Math.round(mean_age*10)/10;
			if (proportion_source_get_incidents != 0) proportion_source_get_incidents = (double) Math.round(proportion_source_get_incidents*1000)/1000;
		}
	}
	
	
	public CreateResult (MedicalGraph graph, HashMap<String,Double> applic_features, NodeLabels nodelabels,ClusterLabels clusterlabels ) {
		this.graph=graph;
		this.riskgraph = graph.getApplicableGraphRisk(applic_features);
		if (riskgraph!=null) hasRiskGraph=true;
		this.othergraphs=graph.getApplicableGraphNonRisk(applic_features);
		this.nodelabels = nodelabels;
		this.clusterlabels = clusterlabels;
	}
	
	
	protected void addRisks2Result (HashMap<Node,Double> features, Node targetnode, OnlineNode targetresult) {
		targetresult.risk=graph.getRisk4Target(targetnode, features, riskgraph);
		if (targetresult.risk < 0.01) targetresult.risk = 0; //basically: exclude risks <1%
		else {
			//double baserisk = graph.getRisk(key, baseriskfeatures);
			//if (baserisk==0.) baserisk =result.incidence;
			//result.rrisk=result.risk/baserisk;
			targetresult.rrisk=targetresult.risk/(targetnode.getIncidence(riskgraph)*4); //targetresult.incidence; //CAVE: currently calculated like this... to be discussed!
		}
	}

	
	protected OnlineNode populateNode (Node node, boolean istarget, boolean isnew, boolean english) {
		OnlineNode result = new OnlineNode();
		
		result.key=node.getCode();
		result.istarget=istarget;
		result.isnew=isnew;
		
		NodeStatistics stats = node.getNodeStatistics(riskgraph);
		if (stats != null) {
			result.prevalence=stats.prevalence;
			result.incidence=stats.incidence;
			result.mean_age=stats.mean_age_incidence;
		}
			
		result.typekey=nodelabels.getType4Code(node);
		result.clusterkey=nodelabels.getCluster4Code(node);
		result.label=nodelabels.getLabel4Code(node, english);
		result.typelabel=clusterlabels.getLabel4Code(result.typekey, english);
		result.clusterlabel=clusterlabels.getLabel4Code(result.clusterkey, english);
		
		return result;
	}
	
	
	
	public void createNodes(HashMap<Node,Double> features, boolean english, int topX) {
		this.features=features;
		OnlineNode onlinenode;
		
		//collect info for source-nodes (which cannot be targets as graph models are incident only)
		for (Node feature : features.keySet()) {
			onlinenode = populateNode(feature,false,false,english);
			onlinenode.roundMe();
			feature_nodes.add(onlinenode); 
		}
		
		//now RISK targets
		if (hasRiskGraph) {
			for (Node target : graph.getAllTargets(riskgraph)) {
					if (!features.containsKey(target)) {
						//only new diseases and treatments (as graph models are build like that!)
						onlinenode = populateNode(target,true,true,english);	
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
		}
		
		
		//NOW OTHER nodes connected to risk targets
		/*
		boolean isnew;
		for (OnlineNode risknode: risks) {
			for (Node connectednode : graph.getConnectedNodes(othergraphs,graph.getNode(risknode.key))) {
				isnew=!features.containsKey(connectednode);
				onlinenode = populateNode(connectednode,false,isnew,english);
				othernodes.add(onlinenode);
			}
		}
		for (OnlineNode risknode: risks_relative) {
			for (Node connectednode : graph.getConnectedNodes(othergraphs,graph.getNode(risknode.key))) {
				isnew=!features.containsKey(connectednode);
				onlinenode = populateNode(connectednode,false,isnew,english);
				othernodes.add(onlinenode);
			}
		}*/
		
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
		newresult.add(rel.key,rel);
		newresult.add(abs.key,abs);
		//has_successor
		
		unravelRiskNodes(rel,risks_relative,english);
		unravelRiskNodes(abs,risks,english);
		return newresult;
	}
	
	protected void unravelRiskNodes (TreeNode root, List<OnlineNode> risklist, boolean english) {
		TreeNode node ;
		TreeNode subnode_risks;
		TreeNode subnode_other;
		OnlineNode onlinenode;
		HashMap<String,OnlineNode> onlinenode_arr;
		
		//Add targets where risk nodes are source from othergraphs
		HashMap<String,HashSet<Node>> targets_from_risk;
		boolean isnew;
		for (OnlineNode risk: risklist) {
			node = new TreeNode(risk.key,risk.label);
			subnode_risks = new TreeNode(Consts.riskRelationName,clusterlabels.getLabel4Code(Consts.riskRelationName, english));
			subnode_risks.add(risk.key,risk);
			node.add(subnode_risks.key,subnode_risks);
			
			//add info from othergraphs nodes by relation
			targets_from_risk = graph.getTargetNodesByRelation(othergraphs, graph.getNode(risk.key));
			for (String relation : targets_from_risk.keySet()) {
				onlinenode_arr = new HashMap<String,OnlineNode>();
				for (Node n : targets_from_risk.get(relation)) {
					isnew=!features.containsKey(n);
					onlinenode=populateNode(n,false,isnew,english);
					onlinenode_arr.put(onlinenode.key,onlinenode);
				}
				subnode_other= new TreeNode(relation,clusterlabels.getLabel4Code(relation, english));
				subnode_other.addAll(onlinenode_arr.values(),true,true);
				node.add(subnode_other.key,subnode_other);
			}
			root.add(node.key,node);
		}
	}
	
	public TreeNode graphNode(boolean english) {
		TreeNode newresult = new TreeNode("GRAPH","Graph");

		//add nodes
		HashSet<OnlineNode> combresults = new HashSet<OnlineNode>(feature_nodes); //use HashSet to add a node only once
	
		combresults.addAll(risks);
		combresults.addAll(risks_relative);
		//combresults.addAll(othernodes);//ToDo: Re-Include other relations
		
		TreeNode nodetree = new TreeNode("NODES","Nodes");
		nodetree.addAll(combresults,true,false);
		newresult.add(nodetree.key,nodetree);
				
		//add links
		TreeNode linktree = constructTreeLinks(nodetree,"LINKS","Links",english,true);
		newresult.add(linktree.key,linktree);
		
		return newresult;
	}
	
	
	public TreeNode constructTreeLinks(TreeNode nodetree, String typekey, String typelabel, boolean english, boolean addIndirect) {
		TreeNode newlinks = new TreeNode(typekey,typelabel); 
		//now links -> for all nodes (with each other)
		LinkResult link;
		Node sourcenode;
		Node targetnode;
		OnlineNode onlinesource;
		OnlineNode onlinetarget;
		boolean constructLink = true;
		Edge e;
		EdgeStatistics stats;
		for (String source : nodetree.getChildrenKeys()) {
			for (String target : nodetree.getChildrenKeys()) {
				sourcenode=graph.getNode(source);
				targetnode=graph.getNode(target);
				if (graph.hasEdge(riskgraph,sourcenode, targetnode)) { //ToDo add relations from other graphs
					if (!addIndirect) {
						onlinesource = (OnlineNode)nodetree.children.get(source);
						onlinetarget = (OnlineNode)nodetree.children.get(target);
						constructLink=onlinesource.istarget || onlinesource.isnew || onlinetarget.istarget || onlinetarget.isnew;
					}
					if (constructLink) {
						e = graph.getEdge(sourcenode, targetnode);
						link = new LinkResult();
						link.source=source;
						link.target=target;
						stats=e.getEdgeStatistics(riskgraph);
						if (stats != null) {
							link.odds=stats.or;
							link.beta=stats.beta;
							link.proportion_source_get_incidents=stats.proportion_source_get_incidents;
							link.mean_age=stats.mean_age_of_incident_patients_with_condition_source;
							link.pvalue=stats.pvalue;
							link.isSignificant=stats.isSignificant;
							link.typekey=Consts.riskRelationName;
							link.typelabel=clusterlabels.getLabel4Code(link.typekey, english);
							link.roundMe();
						}
						newlinks.add(source.concat(target),link);
					}
				}
			}
		}
		return newlinks;
	}
	
	public TreeNode clusterNode(boolean english) {
		//create Node structure
		TreeNode newresult;
		if (hasRiskGraph)
			newresult = new TreeNode("CLUSTER",this.graph.getClusterName(riskgraph, english));
		else newresult = new TreeNode("CLUSTER","");
		
		return newresult;
	}
	
	
	public void calcSingleNodeList(Node node, boolean english) {
		OnlineNode onlinenode;
		
		//first: single node
		onlinenode = populateNode(node,true,true,english);
		onlinenode.roundMe();
		feature_nodes.add(onlinenode); 
		
		HashSet<Node> connectedNodes = graph.getConnectedNodes(riskgraph,node); //ToDo: add other graphs/relations
		//collect info for source-nodes (which cannot be targets as graph models are incident only)
		for (Node cnode : connectedNodes) {
			onlinenode = populateNode(cnode,false,false,english);
			onlinenode.roundMe();
			feature_nodes.add(onlinenode); 
		}
	}

	
	
	public TreeNode singleNode(boolean english) {
		TreeNode newresult = new TreeNode("GRAPH","Graph");
		TreeNode nodetree = new TreeNode("NODES","Nodes");
		nodetree.addAll(feature_nodes,true);
		newresult.add(nodetree.key,nodetree);

		TreeNode linktree = constructTreeLinks(nodetree,"LINKS","Links",english,false);
		newresult.add(linktree.key,linktree);
		
		return newresult;
	}
	
	
	
	
}
