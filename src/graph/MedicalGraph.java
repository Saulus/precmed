package graph;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import au.com.bytecode.opencsv.CSVReader;
import configuration.Consts;
import utils.Utils;

class GraphApplicability {
	public boolean isRestricted = false;
	public int age_min = -1;
	public int age_max = -1;
	public int gender = -1; //0-> wbl; 1-> mnl
	public boolean isRiskGraph = false;
	
	public GraphApplicability() {
		
	}
	
	public boolean isApplicable (HashMap<String,Double> applic_features) {
		if (!isRestricted) return true;
		boolean isApplicable = (age_min==-1) ||  (applic_features.get(Consts.alterattribute) >= age_min && applic_features.get(Consts.alterattribute)<=age_max);
		isApplicable = isApplicable && ((gender==-1) ||  (applic_features.get(Consts.geschlechtattribute)==gender));
		return isApplicable;
	}
	
}

public class MedicalGraph {
	
	private NodeList nodes = new NodeList(); //nodes include statistics separated by graphname
	private EdgeList edges = new EdgeList(); 
	private HashMap <String, GraphApplicability> graphs = new HashMap <String, GraphApplicability>(); //graphname -> rules
	
	private HashMap<String,HashSet<String>> graph_relations = new HashMap<String,HashSet<String>>(); //graphname -> relations
	
	private HashMap <String, HashSet<Node>> targetnodes = new  HashMap <String, HashSet<Node>>(); //graphname -> rules
	private HashMap <String, HashSet<Node>> sourcenodes = new  HashMap <String, HashSet<Node>>(); //graphname -> rules
	
		
			
	public MedicalGraph(String graph_path)  {
		//Read in graphdata
		File[] graphdirs = new File(graph_path).listFiles();
		for (File dir : graphdirs) {
			if (dir.isDirectory()) {
				try {
					readInGraph(dir);
				} catch (Exception e) {
					System.err.println("Fehler gefunden beim Einlesen der Konfiguration aus " + dir.getPath());
					System.err.println(e.getMessage());
					e.printStackTrace();
				}
			}
		}
		
		
	}
	
		
	private void readInGraph (File subgraphdir) throws Exception {
		//directory name = graphname
		String graphname = subgraphdir.getName();
		targetnodes.put(graphname, new HashSet<Node>());
		sourcenodes.put(graphname, new HashSet<Node>());
		graph_relations.put(graphname,  new HashSet<String>());
		GraphApplicability ga = new GraphApplicability();
		if (graphname.contains("risk")) {
			//is risk graph
			ga.isRiskGraph=true;
			if (graphname.contains("w")) {
				ga.gender = 0;
				ga.isRestricted=true;
			} else if (graphname.contains("m")) {
				ga.gender = 1;
				ga.isRestricted=true;
			}
			if (graphname.contains("00")) {
				ga.age_min=0;
				ga.age_max=0;
				ga.isRestricted=true;
			} else if (graphname.contains("14")) {
				ga.age_min=1;
				ga.age_max=14;
				ga.isRestricted=true;
			} else if (graphname.contains("40")) {
				ga.age_min=15;
				ga.age_max=40;
				ga.isRestricted=true;
			} else if (graphname.contains("66")) {
				ga.age_min=41;
				ga.age_max=66;
				ga.isRestricted=true;
			} else if (graphname.contains("99")) {
				ga.age_min=67;
				ga.age_max=999;
				ga.isRestricted=true;
			}
		}
		//directory should contain nodes (filename includes "nodes") and edges (filename includes "edges")
		File[] files = new File(subgraphdir.getPath()).listFiles();
		//If this pathname does not denote a directory, then listFiles() returns null.

		ArrayList<File> nodesFiles = new ArrayList<File>();
		ArrayList<File> edesFiles = new ArrayList<File>();

		for (File file : files) 
			if (file.isFile())
				if (file.getName().contains("nodes")) nodesFiles.add(file);
				else if (file.getName().contains("edges")) edesFiles.add(file);

		for (File file : nodesFiles) {
			this.nodes=readInNodesList(file,nodes,graphname);
		}
		
		for (File file : edesFiles) {
			edges=readInEdgeList(file,edges,nodes,graphname);
			edges.testSignificance();
		}
		graphs.put(graphname, ga);

	}
	
	
	public static String readInNodeCode(String code_raw) {
		if (code_raw.contains(".")) {
			code_raw=code_raw.substring(0, code_raw.indexOf("."));
		}
		return code_raw.toUpperCase().replace(Consts.icdattribute, "").replace(Consts.atcattribute, "");
	}
	
	public NodeList readInNodesList(File file, NodeList nodes, String graphname) throws Exception {
		Charset inputCharset = Charset.forName("ISO-8859-1");
		CSVReader reader = new CSVReader(new InputStreamReader(new FileInputStream(file), inputCharset), ';', '"'); //UTF-8?
		List<String[]> readIn = reader.readAll();
		reader.close();
		//assign colnumbers for columns needed
		String[] headerline = readIn.get(0);
		readIn.remove(0);
		int codecol=0;
		int alternative_codecol=0;
		int prevalencecol=1;
		int incidencecol=2;
		int mean_age_incidencecol=3;
		int mean_age_prevalencecol=4;
		//and re-assign
		for (int i =0; i<headerline.length; i++) {
			if (headerline[i].equals("Node")) codecol=i;
			if (headerline[i].equals("NodeCUI")) alternative_codecol=i;
			if (headerline[i].equals("prevalence")) prevalencecol=i;
			if (headerline[i].equals("incidence")) incidencecol=i;
			if (headerline[i].equals("Mean age of incident")) mean_age_incidencecol=i;
			if (headerline[i].equals("Mean age prevalence")) mean_age_prevalencecol=i;
		}
		if (readIn.size()==0 )
			throw new Exception("Configuration File " + file + "is empty");
		
		String code;
		String altcode;
		double prevalence;
		double incidence;
		int mean_age_incidence;
		int mean_age_prevalence;
		
		for (String[] nextline : readIn) {
			if (nextline.length>1) {
				code=readInNodeCode(nextline[codecol]);
				altcode=readInNodeCode(nextline[alternative_codecol]);
				prevalence=Utils.parseDouble(nextline[prevalencecol]);
				incidence=Utils.parseDouble(nextline[incidencecol]);
				mean_age_incidence=Utils.parseInt(nextline[mean_age_incidencecol]);
				mean_age_prevalence=Utils.parseInt(nextline[mean_age_prevalencecol]);
				
				if (code.equals(Consts.geschlechtattribute)) {
					//Translate gender into two vars: ismale & isfemale
					nodes.addNode("",Consts.maleCUI,graphname,prevalence,incidence,mean_age_incidence,mean_age_prevalence); //ismale
					nodes.addNode("",Consts.femaleCUI,graphname,(100-prevalence),incidence,mean_age_incidence,(mean_age_prevalence+1)); //isfemale... mean_age_prevalence is not correct (calculated for men only)
				} else
					nodes.addNode(code,altcode,graphname,prevalence,incidence,mean_age_incidence,mean_age_prevalence);
			}
		}
		return nodes;
	}
	
	
	public static String readInEdgeRelation(String relation_raw) {
		return relation_raw.toLowerCase().replace(" ", "_");
	}
	
	public EdgeList readInEdgeList(File file, EdgeList edges, NodeList nodes, String graphname) throws Exception {
		Node interceptnode = nodes.getNode(Consts.intercept);
		Charset inputCharset = Charset.forName("ISO-8859-1");

		CSVReader reader = new CSVReader(new InputStreamReader(new FileInputStream(file), inputCharset), ';', '"'); //UTF-8?
		List<String[]> readIn = reader.readAll();
		reader.close();
		String[] headerline = readIn.get(0);
		readIn.remove(0);
		//assign colnumbers for columns needed
		int relationcol=99;
		int sourcecol=99;
		int source_alternativecol=99;
		int targetcol=99;
		int target_alternativecol=99;
		int orcol=99;
		int betacol=99;
		int pvalcol=99;
		int number_relationscol=99;
		int proportion_of_incidents_have_sourcecol=99;
		int proportion_source_get_incidentscol=99;
		int mean_agecol=99;

		//and re-assign
		for (int i =0; i<headerline.length; i++) {
			if (headerline[i].equals("Relation")) relationcol=i;
			if (headerline[i].equals("Source")) sourcecol=i;
			if (headerline[i].equals("SourceICD")) sourcecol=i;
			if (headerline[i].equals("SourceCUI")) source_alternativecol=i;
			if (headerline[i].equals("Target")) targetcol=i;
			if (headerline[i].equals("TargetICD")) targetcol=i;
			if (headerline[i].equals("TargetCUI")) target_alternativecol=i;
			if (headerline[i].equals("OR")) orcol=i;
			if (headerline[i].equals("beta")) betacol=i;
			if (headerline[i].equals("p-value")) pvalcol=i;
			if (headerline[i].equals("number relations")) number_relationscol=i;
			if (headerline[i].equals("proportion of incidents have source")) proportion_of_incidents_have_sourcecol=i;
			if (headerline[i].equals("proportion source get incidents")) proportion_source_get_incidentscol=i;
			if (headerline[i].equals("Mean age of incident patients with condition source")) mean_agecol=i;
		}
		//some cols might not be present
		if (targetcol==99) targetcol=target_alternativecol;
		if (target_alternativecol==99) target_alternativecol=targetcol;
		if (sourcecol==99) sourcecol=source_alternativecol;
		if (source_alternativecol==99) source_alternativecol=sourcecol;

		if (readIn.size()==0 )
			throw new Exception("Configuration File " + file.getName() + "is empty");
		Node source;
		Node target;
		String relation="";
		double or;
		double beta;
		double pvalue;
		double number_relations;
		double proportion_of_incidents_have_source;
		double proportion_source_get_incidents;
		int mean_age_of_incident_patients_with_condition_source;
		for (String[] nextline : readIn) {
			if (nextline.length>1) {
				
				if (relation.equals(Consts.riskRelationName)) {
					//(Node source, Node target, String relation,double or,double beta,double pvalue,double number_relations,double proportion_of_incidents_have_source,double proportion_source_get_incidents,int mean_age_of_incident_patients_with_condition_source) {
					or=Utils.parseDouble(nextline[orcol]);
					beta=Utils.parseDouble(nextline[betacol]);
					pvalue=Utils.parseDouble(nextline[pvalcol]);
					number_relations=Utils.parseDouble(nextline[number_relationscol]);
					proportion_of_incidents_have_source=Utils.parseDouble(nextline[proportion_of_incidents_have_sourcecol]);
					proportion_source_get_incidents=Utils.parseDouble(nextline[proportion_source_get_incidentscol]);
					mean_age_of_incident_patients_with_condition_source=Utils.parseInt(nextline[mean_agecol]);
					
					// check for Nodes; or create
					target=nodes.getNode(readInNodeCode(nextline[targetcol]),readInNodeCode(nextline[target_alternativecol]));
					relation=readInEdgeRelation(nextline[relationcol]);
					if (!graph_relations.get(graphname).contains(relation)) graph_relations.get(graphname).add(relation);
					
					//Differentiate Gender
					if (readInNodeCode(nextline[sourcecol]).equals(Consts.geschlechtattribute)) {
						source=nodes.getNode("",Consts.maleCUI);
						edges.addEdge(relation,source,target,graphname,or,beta,pvalue,number_relations,proportion_of_incidents_have_source,proportion_source_get_incidents,mean_age_of_incident_patients_with_condition_source);
						
						source=nodes.getNode("",Consts.femaleCUI);
						edges.addEdge(relation,source,target,graphname,Math.exp(-beta),(-beta),pvalue,number_relations,proportion_of_incidents_have_source,proportion_source_get_incidents,mean_age_of_incident_patients_with_condition_source);
						//ToDO: number_relations etc. above are not correct (only calculated for men)
					} else {
						source=nodes.getNode(readInNodeCode(nextline[sourcecol]),readInNodeCode(nextline[source_alternativecol]));
						edges.addEdge(relation,source,target,graphname,or,beta,pvalue,number_relations,proportion_of_incidents_have_source,proportion_source_get_incidents,mean_age_of_incident_patients_with_condition_source);
					}

				} else {
					// check for Nodes; or create
					source=nodes.getNode(readInNodeCode(nextline[sourcecol]),readInNodeCode(nextline[source_alternativecol]));
					target=nodes.getNode(readInNodeCode(nextline[targetcol]),readInNodeCode(nextline[target_alternativecol]));
					relation=readInEdgeRelation(nextline[relationcol]);
					edges.addEdge(relation,source,target);
				}
				
				targetnodes.get(graphname).add(target);
				sourcenodes.get(graphname).add(source);
			}
		}
		edges.setInterceptNode(interceptnode);
		return edges;
	}
	
	
	public String getApplicableGraphRisk (HashMap<String,Double> applic_features) {
		//returns first applicable risk graph
		for (String graph: graphs.keySet()) {
			if (graphs.get(graph).isRiskGraph && graphs.get(graph).isApplicable(applic_features)) return graph;
		}
		return null;
	}
	
	
	public HashSet<String> getApplicableGraphNonRisk (HashMap<String,Double> applic_features) {
		//returns all graphs that are non risk
		HashSet<String> app_graphs = new HashSet<String>();
		for (String graph: graphs.keySet()) {
			if (!graphs.get(graph).isRiskGraph && !graph.equals(Consts.generalStatisticsGraph) && graphs.get(graph).isApplicable(applic_features)) app_graphs.add(graph);
		}
		return app_graphs;
	}	
	
	
	public Node getNode(String key) {
		return this.nodes.getNode(key);
	}
	
	public double getRisk4Target(Node target, HashMap<Node,Double> features, String graphname)  {
		return edges.getRisk4Target(target, features, graphname);
	}
	
	public Set<Node> getAllTargets(String graphname) {
		
		return targetnodes.get(graphname);
	}
	
	public HashSet<Node> getConnectedNodes(String graphname, Node sourcenode) {
		HashSet<Node> intersection = new HashSet<Node>(targetnodes.get(graphname)); 
		intersection.addAll(sourcenodes.get(graphname));
		intersection.retainAll(edges.getConnectedNodes(sourcenode));
		
		return intersection;
	}
	
	public Set<Node> getConnectedNodes(HashSet<String> graphnames, Node sourcenode) {
		Set<Node> intersection = new HashSet<Node>();
		for (String graphname : graphnames) {
			intersection.addAll(targetnodes.get(graphname));
			intersection.addAll(sourcenodes.get(graphname));
		}
		intersection.retainAll(edges.getConnectedNodes(sourcenode));
		
		return intersection;
	}
	
	
	public HashMap<String,HashSet<Node>> getTargetNodesByRelation(HashSet<String> graphnames, Node sourcenode) {
		HashMap<String,HashSet<Node>> targets = new HashMap<String,HashSet<Node>>(edges.getTargetNodesByRelation(sourcenode)); //copy to intersect
		
		Set<Node> intersection = new HashSet<Node>();
		for (String graphname : graphnames) {
			intersection.addAll(targetnodes.get(graphname));
		}
		
		//keep only targets that are in graph
		for (String rel: targets.keySet()) {
			targets.get(rel).retainAll(intersection);
		}
		
		return targets;
	}
	
	public boolean hasEdge (String graphname,Node sourcenode, Node targetnode) {
		return edges.hasEdge(graphname,sourcenode,targetnode);
	}
	
	public Edge getEdge(Node sourcenode, Node targetnode) {
		return edges.getEdge(sourcenode,targetnode);
	}
	

}
