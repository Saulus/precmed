package graph;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.google.gson.Gson;

import lists.AList;



/*
 * Interface class
 */
public class CreateResult {
	private int topX;
	private AList icdlist;
	private AList atclist;
	private AList clusterlist;

	
	List<ResultSet> icdresults = new ArrayList<ResultSet>();
	List<ResultSet> icdresults_relative;
	List<ResultSet> atcresults = new ArrayList<ResultSet>();
	List<ResultSet> atcresults_relative;
	
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
		
		public ResultSet() {	
		}
		
		public void roundMe () {
				risk = (double) Math.round(risk*1000)/1000;
				if (rrisk != 0) rrisk = (double) Math.round(rrisk*100)/100;
				if (prevalence != 0) prevalence = (double) Math.round(prevalence*10000)/10000;
				if (incidence != 0) incidence = (double) Math.round(incidence*10000)/10000;
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
	
	class TreeNode {
		public String key;
		public String label;
		public ArrayList<Object> children;
		
		public TreeNode(String key, String label) {
			this.key=key;
			this.label=label;
			this.children=new ArrayList<Object>(); 
		}
		
		public TreeNode(String key, String label, ArrayList<Object> list) {
			this.key=key;
			this.label=label;
			this.children=list;
		}
		
		public void add(Object a) {
			children.add(a);
		}
		
		public ArrayList<Object> getChildren () {
			return children;
		}
		
	}

	
	class LinkResult {
		public String source;
		public String target;
		public Double odds;
		public Double oddsScaled;
		public String typekey="";
		public String typelabel;
	}
	
	
	public CreateResult (int topX, AList icdlist, AList atclist, AList clusterlist) {
		this.topX=topX;
		this.icdlist=icdlist;
		this.atclist=atclist;
		this.clusterlist=clusterlist;
	}

	
	public void calc(Graphdata graph, HashMap<String,Double> features, boolean english) {
		Set<String> targets = graph.getTargetList();
		
		ResultSet result;
		
		for (String target : targets) {
			if (!features.containsKey(target)) {
				//only new diseases and treatments (as graph models are build like that!)
				result = createAndPopulateResult(target,graph,features,true,english);
				if (result.typekey=="DIS") icdresults.add(result);
				else atcresults.add(result);
			}
		}
		//sort and limit
		icdresults_relative = new ArrayList<ResultSet>(icdresults);
		atcresults_relative = new ArrayList<ResultSet>(atcresults);
		Collections.sort(icdresults, new AbsComp());
		Collections.sort(icdresults_relative, new RelComp());
		Collections.sort(atcresults, new AbsComp());
		Collections.sort(atcresults_relative, new RelComp());
		
		icdresults =  icdresults.subList(0, topX);
		icdresults_relative = icdresults_relative.subList(0, topX);
		atcresults = atcresults.subList(0, topX);
		atcresults_relative = atcresults_relative.subList(0, topX);
	}
	
	
	private ResultSet createAndPopulateResult (String key, Graphdata graph, HashMap<String,Double> features, boolean istarget, boolean english) {
		ResultSet result = new ResultSet();
		result.key=key;
		result.prevalence=graph.getPrevalence(key);
		result.incidence=graph.getIncidence(key);
		result.mean_age=graph.getMeanAgeIncidence(key);
		if (istarget) {
			result.risk=graph.getRisk(key, features);
			result.rrisk=result.risk/result.incidence;
		} else {
			result.risk=1; // already present
			result.rrisk=result.risk/result.prevalence;
		}
		result.roundMe();
		
		//Disease?
		if (icdlist.containsKey(key)) {
			result.clusterkey=icdlist.getClusterKey(key);
			result.label=icdlist.getName(key,english);
			result.typekey="DIS";
			if (english) 
				result.typelabel="Disease";
			else result.typelabel="Krankheit";
		} else if (atclist.containsKey(key)) {
			result.clusterkey=atclist.getClusterKey(key);
			result.label=atclist.getName(key,english);
			result.typekey="MED";
			if (english) 
				result.typelabel="Medication";
			else result.typelabel="Medikamentation";
		}
		result.clusterlabel=clusterlist.getName(result.clusterkey, english);
		
		return result;
	}

	
	public String graphJson(Gson gson, boolean english, Graphdata graph, HashMap<String,Double> features) {
		TreeNode newresult = new TreeNode("ROOT","Graph");
		TreeNode rel = new TreeNode("REL","Relative");
		newresult.add(rel);
		TreeNode abs = new TreeNode("ABS","Absolute");
		newresult.add(abs);
		TreeNode rel_nodes = new TreeNode("NODES","Nodes"); rel.add(rel_nodes);
		TreeNode rel_links = new TreeNode("LINKS","Links"); rel.add(rel_links);
		TreeNode abs_nodes = new TreeNode("NODES","Nodes"); abs.add(abs_nodes);
		TreeNode abs_links = new TreeNode("LINKS","Links"); abs.add(abs_links);

		//Now collect source-nodes (which cannot be targets as graph models are incident only)
		ResultSet node;
		for (String feature : features.keySet()) {
			node = createAndPopulateResult(feature,graph,features,false,english);	
			rel_nodes.add(node); 
			abs_nodes.add(node);
		}
			
		//Now collect target nodes
		for (ResultSet result : icdresults) abs_nodes.add(result);
		for (ResultSet result : atcresults) abs_nodes.add(result);
		for (ResultSet result : icdresults_relative) rel_nodes.add(result);
		for (ResultSet result : atcresults_relative) rel_nodes.add(result);
		
		//now links -> for all nodes (with each other)
		LinkResult link;
		for (Object r1 : abs_nodes.getChildren()) {
			String source = ((ResultSet) r1).key;
			for (Object r2 : abs_nodes.getChildren()) {
				String target = ((ResultSet) r2).key;
				if (graph.hasEdge(source, target)) {
					link = new LinkResult();
					link.source=source;
					link.target=target;
					link.odds=graph.getOdds(source, target);
					link.oddsScaled=graph.getOddsScaled(source, target);
					link.typekey="ODDS";
					link.typekey="Odds";
					abs_links.add(link);
				}
			}
		}
		
		for (Object r1 : rel_nodes.getChildren()) {
			String source = ((ResultSet) r1).key;
			for (Object r2 : rel_nodes.getChildren()) {
				String target = ((ResultSet) r2).key;
				if (graph.hasEdge(source, target)) {
					link = new LinkResult();
					link.source=source;
					link.target=target;
					link.odds=graph.getOdds(source, target);
					link.oddsScaled=graph.getOddsScaled(source, target);
					link.typekey="ODDS";
					link.typekey="Odds";
					rel_links.add(link);
				}
			}
		}
		
		return gson.toJson(newresult);
	}
	
	public String riskJson(Gson gson, boolean english) {
		//create Node structure
		TreeNode newresult = new TreeNode("ROOT","Risks");
		TreeNode rel;
		TreeNode abs;
		TreeNode rel_sec1;
		TreeNode rel_sec2;
		TreeNode abs_sec1;
		TreeNode abs_sec2;
		if (english) {
			rel = new TreeNode("REL","Relative");
			newresult.add(rel);
			abs = new TreeNode("ABS","Absolute");
			newresult.add(abs);
			rel_sec1 = new TreeNode("DIS","Disease");
			rel_sec2 = new TreeNode("MED","Medication");
			abs_sec1 = new TreeNode("DIS","Disease");
			abs_sec2 = new TreeNode("MED","Medication");
		} else {
			rel = new TreeNode("REL","Relativ");
			newresult.add(rel);
			abs = new TreeNode("ABS","Absolut");
			newresult.add(abs);
			rel_sec1 = new TreeNode("DIS","Krankheit");
			rel_sec2 = new TreeNode("MED","Medikamentation");
			abs_sec1 = new TreeNode("DIS","Krankheit");
			abs_sec2 = new TreeNode("MED","Medikamentation");
		}
		
		rel.add(rel_sec1);
		rel.add(rel_sec2);
		abs.add(abs_sec1);
		abs.add(abs_sec2);
		
		nodesToCluster(rel_sec1,icdresults_relative,english);
		nodesToCluster(rel_sec2,atcresults_relative,english);
		nodesToCluster(abs_sec1,icdresults,english);
		nodesToCluster(abs_sec2,atcresults,english);
		return gson.toJson(newresult);
	}
	
	private void nodesToCluster (TreeNode root, List<ResultSet> resultlist, boolean engl) {
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
