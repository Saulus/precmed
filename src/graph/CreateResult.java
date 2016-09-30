package graph;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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

	
	List<ResultSet> fullresults = new ArrayList<ResultSet>();
	List<ResultSet> fullresults_relative = new ArrayList<ResultSet>();
	
	List<ResultSet> predictions = new ArrayList<ResultSet>();
	List<ResultSet> treatments = new ArrayList<ResultSet>();
	List<ResultSet> predictions_relative = new ArrayList<ResultSet>();
	List<ResultSet> treatments_relative = new ArrayList<ResultSet>();
	
	
	class ResultSet {
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
		
		public ResultSet() {	
		}
		
		public void roundMe () {
				risk = (double) Math.round(risk*10000)/10000;
				if (rrisk != 0) rrisk = (double) Math.round(rrisk*100)/100;
				//if (prevalence != 0) prevalence = (double) Math.round(prevalence*10000)/10000;
				//if (incidence != 0) incidence = (double) Math.round(incidence*10000)/10000;
				if (mean_age != 0) mean_age = (double) Math.round(mean_age*10)/10;
		}
	}
	
	class AbsComp implements Comparator<ResultSet>{
	    @Override
	    public int compare(ResultSet e1, ResultSet e2) {
	    	if(e2.risk > e1.risk) return 1;
	    	if(e2.risk < e1.risk) return -1;
	        return 0;
	    }
	}

	
	class RelComp implements Comparator<ResultSet>{
	    @Override
	    public int compare(ResultSet e1, ResultSet e2) {
	    	if(e2.rrisk > e1.rrisk) return 1;
	    	if(e2.rrisk < e1.rrisk) return -1;
	        return 0;
	    }
	}
	
	
	class LinkResult {
		public int source;
		public int target;
		public double odds;
		public double oddstransformed;
		public double pvalue;
		public double incidence;
		public double mean_age;
		public String typekey="";
		public String typelabel;
		
		public LinkResult() {	
		}
		
		public void roundMe () {
			odds = (double) Math.round(odds*1000000)/1000000;
			oddstransformed = (double) Math.round(oddstransformed*10000)/10000;
			if (pvalue != 0) pvalue = (double) Math.round(pvalue*1000)/1000;
			//if (incidence != 0) incidence = (double) Math.round(incidence*10000)/10000;
			if (mean_age != 0) mean_age = (double) Math.round(mean_age*10)/10;
		}
	}
	
	
	public CreateResult (NodeList nodes,EdgeList edges,NodeLabels nodelabels,ClusterLabels clusterlabels ) {
		this.nodes = nodes;
		this.edges = edges;
		this.nodelabels = nodelabels;
		this.clusterlabels = clusterlabels;
	}

	
	private ResultSet createAndPopulateResult (String key, Graphdata graph, HashMap<String,Double> features,  HashMap<String,Double> baseriskfeatures, boolean istarget, boolean english) {
		ResultSet result = new ResultSet();
		result.key=key;
		result.prevalence=graph.getPrevalence(key);
		result.incidence=graph.getIncidence(key);
		result.mean_age=graph.getMeanAgeIncidence(key);
		result.istarget=istarget;
		if (istarget) {
			result.risk=graph.getRisk(key, features);
			// calc base risk with age & gender
			if (result.risk < 0.01) result.rrisk = 0; //basically: exclude risks <1%
			else {
				//double baserisk = graph.getRisk(key, baseriskfeatures);
				//if (baserisk==0.) baserisk =result.incidence;
				//result.rrisk=result.risk/baserisk;
				result.rrisk=result.risk/result.incidence; //CAVE: currently calculated like this... to be discussed!
			}
		} else {
			result.risk=1; // already present
			result.rrisk=result.risk/result.prevalence;
		}
		result.roundMe();
		result.typekey="GEN";
		result.typelabel="General";
		result.label=key;
		
		for (String listkey : mykeylists.keySet()) {
			if (mykeylists.get(listkey).containsKey(key)) {
				result.clusterkey=mykeylists.get(listkey).getClusterKey(key);
				result.label=mykeylists.get(listkey).getName(key,english);
				result.typekey=listkey;
				result.typelabel=clusterlist.getName(listkey,english);
				break;
			}
		}
		
		result.clusterlabel=clusterlist.getName(result.clusterkey, english);
		
		return result;
	}
	
	public void calcRiskLists(Graphdata graph, HashMap<String,Double> features,  HashMap<String,Double> baseriskfeatures, boolean english, int topX) {
		
		
		Set<String> targets = graph.getTargetList();

		ResultSet result;

		for (String target : targets) {
			if (!features.containsKey(target)) {
				//only new diseases and treatments (as graph models are build like that!)
				result = createAndPopulateResult(target,graph,features,baseriskfeatures,true,english);
				if (result.typekey=="MED") treatments.add(result);
				else predictions.add(result);
			}
		}
		//sort and limit
		predictions_relative = new ArrayList<ResultSet>(predictions);
		//treatments_relative = new ArrayList<ResultSet>(treatments);
		Collections.sort(predictions, new AbsComp());
		Collections.sort(predictions_relative, new RelComp());
		/*Collections.sort(treatments, new AbsComp());
		Collections.sort(treatments_relative, new RelComp());*/

		predictions =  predictions.subList(0, topX);
		fullresults.addAll(predictions);
			for (int i=0; i<predictions.size(); i++) predictions.get(i).topX=i;
		predictions_relative = predictions_relative.subList(0, topX);
		fullresults_relative.addAll(predictions_relative);
			for (int i=0; i<predictions_relative.size(); i++) predictions_relative.get(i).topX=i;
		
		//Now collect source-nodes (which cannot be targets as graph models are incident only)
		ResultSet node;
		for (String feature : features.keySet()) {
			node = createAndPopulateResult(feature,graph,features,baseriskfeatures,false,english);	
			fullresults.add(node); 
			fullresults_relative.add(node);
		}
	}
	
	public void calcSingleNodeList(Graphdata graph, String key, boolean english) {
		ArrayList<String> connectedNodes = graph.getConnectedNodes(key);
		
		ResultSet result;
		
		for (String node : connectedNodes) {
				result = createAndPopulateResult(node,graph,null,null,false,english);
				fullresults.add(result);
		}
	}


	public TreeNode constructTreeNode(List<ResultSet> results,String typekey, String typelabel) {
		TreeNode newresult = new TreeNode(typekey,typelabel);
		for (ResultSet result : results) newresult.add(result);
		
		return newresult;
	}
	
	public TreeNode constructTreeLinks(Graphdata graph, TreeNode node, String typekey, String typelabel) {
		TreeNode newlinks = new TreeNode(typekey,typelabel); 
		//now links -> for all nodes (with each other)
		LinkResult link;
		for (Object r1 : node.getChildren()) {
			String source = ((ResultSet) r1).key;
			for (Object r2 : node.getChildren()) {
				String target = ((ResultSet) r2).key;
				if (graph.hasEdge(source, target)) {
					link = new LinkResult();
					link.source=node.getChildId(r1);
					link.target=node.getChildId(r2);
					link.odds=graph.getOdds(source, target);
					link.oddstransformed=graph.getOddsTransformed(source, target);
					link.incidence=graph.getIncidenceConditionSource(source, target);
					link.mean_age=graph.getMeanAgeIncidenceConditionSource(source, target);
					link.pvalue=graph.getPvalue(source, target);
					link.typekey="ODDS";
					link.typelabel="Odds";
					link.roundMe();
					newlinks.add(link);
				}
			}
		}
		return newlinks;
	}
	
	public TreeNode graphNode(Graphdata graph) {
		TreeNode newresult = new TreeNode("GRAPH","Graph");
		/*TreeNode rel = new TreeNode("REL","Relative");
		newresult.add(rel);
		TreeNode abs = new TreeNode("ABS","Absolute");
		newresult.add(abs);*/
		
		
		/*TreeNode rel_nodes = constructTreeNode (fullresults_relative,"NODES","Nodes");rel.add(rel_nodes);
		TreeNode abs_nodes = constructTreeNode (fullresults,"NODES","Nodes");abs.add(abs_nodes);*/
		//combine REL und ABS results
		HashSet<ResultSet> combresults = new HashSet<ResultSet>(fullresults);
		combresults.addAll(fullresults_relative);
		
		TreeNode nodes = constructTreeNode (new ArrayList<ResultSet>(combresults),"NODES","Nodes");newresult.add(nodes);
				
		/*TreeNode rel_links = constructTreeLinks(graph,rel_nodes,"LINKS","Links");rel.add(rel_links);
		TreeNode abs_links = constructTreeLinks(graph,abs_nodes,"LINKS","Links");abs.add(abs_links);*/
		TreeNode links = constructTreeLinks(graph,nodes,"LINKS","Links");newresult.add(links);
		
		return newresult;
	}
	
	public TreeNode singleNode(Graphdata graph) {
		TreeNode newresult = new TreeNode("GRAPH","Graph");
		TreeNode nodes = constructTreeNode (fullresults,"NODES","Nodes");newresult.add(nodes);
		TreeNode links = constructTreeLinks(graph,nodes,"LINKS","Links");newresult.add(links);
		
		return newresult;
	}
	
	public TreeNode riskNode(boolean english) {
		//create Node structure
		TreeNode newresult = new TreeNode("LIST","List");
		TreeNode rel;
		TreeNode abs;
		/*TreeNode rel_sec1;
		TreeNode rel_sec2;
		TreeNode abs_sec1;
		TreeNode abs_sec2;*/
		if (english) {
			rel = new TreeNode("REL","Relative");
			newresult.add(rel);
			abs = new TreeNode("ABS","Absolute");
			newresult.add(abs);
			/*rel_sec1 = new TreeNode("DIS","Disease");
			rel_sec2 = new TreeNode("MED","Medication");
			abs_sec1 = new TreeNode("DIS","Disease");
			abs_sec2 = new TreeNode("MED","Medication");*/
		} else {
			rel = new TreeNode("REL","Relativ");
			newresult.add(rel);
			abs = new TreeNode("ABS","Absolut");
			newresult.add(abs);
			/*rel_sec1 = new TreeNode("DIS","Krankheit");
			rel_sec2 = new TreeNode("MED","Medikamentation");
			abs_sec1 = new TreeNode("DIS","Krankheit");
			abs_sec2 = new TreeNode("MED","Medikamentation");*/
		}
		
		/*rel.add(rel_sec1);
		rel.add(rel_sec2);
		abs.add(abs_sec1);
		abs.add(abs_sec2);*/
				
		
		/*nodesToCluster(rel_sec1,icdresults_relative);
		nodesToCluster(rel_sec2,atcresults_relative);
		nodesToCluster(abs_sec1,icdresults);
		nodesToCluster(abs_sec2,atcresults);*/
		nodesToCluster(rel,predictions_relative);
		nodesToCluster(abs,predictions);
		return newresult;
	}
	
	private void nodesToCluster (TreeNode root, List<ResultSet> resultlist) {
		HashMap<String,TreeNode> clustered = new HashMap<String,TreeNode>();
		TreeNode node ;
		
		for (ResultSet r : resultlist) {
			if (!clustered.containsKey(r.clusterkey)) {
				node = new TreeNode(r.clusterkey,r.clusterlabel);
				clustered.put(r.clusterkey, node);
				root.add(node);
			}
			clustered.get(r.clusterkey).add(r);
		}
	}
}
