package graph;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.util.HashMap;
import java.util.List;

import au.com.bytecode.opencsv.CSVReader;

public class EdgeList {
	private HashMap<String,HashMap<Node,HashMap<Node,Edge>>> edges_by_relation_target_source = new HashMap<String,HashMap<Node,HashMap<Node,Edge>>>();
	
	
	public EdgeList () {
	}
	
	public void readInLists(String path, NodeList nodes) throws Exception {
		Charset inputCharset = Charset.forName("ISO-8859-1");
		File[] files = new File(path).listFiles();
		//If this pathname does not denote a directory, then listFiles() returns null. 

		for (File file : files) {
		    if (file.isFile()) {
		    	CSVReader reader = new CSVReader(new InputStreamReader(new FileInputStream(file), inputCharset), ';', '"'); //UTF-8?
		    	List<String[]> readIn = reader.readAll();
				reader.close();
				String[] headerline = readIn.get(0);
				readIn.remove(0);
				//assign colnumbers for columns needed
				int relationcol=0;
				int sourcecol=1;
				int targetcol=2;
				int orcol=3;
				int betacol=4;
				int pvalcol=5;
				int number_relationscol=6;
				int proportion_of_incidents_have_sourcecol=7;
				int proportion_source_get_incidentscol=8;
				int mean_agecol=9;
				
				//and re-assign
				for (int i =0; i<headerline.length; i++) {
					if (headerline[i].equals("Relation")) relationcol=i;
					if (headerline[i].equals("Source")) sourcecol=i;
					if (headerline[i].equals("Target")) targetcol=i;
					if (headerline[i].equals("OR")) orcol=i;
					if (headerline[i].equals("beta")) betacol=i;
					if (headerline[i].equals("p-value")) pvalcol=i;
					if (headerline[i].equals("number relations")) number_relationscol=i;
					if (headerline[i].equals("proportion of incidents have source")) proportion_of_incidents_have_sourcecol=i;
					if (headerline[i].equals("proportion source get incidents")) proportion_source_get_incidentscol=i;
					if (headerline[i].equals("Mean age of incident patients with condition source")) mean_agecol=i;
				}
				
				if (readIn.size()==0 )
					throw new Exception("Configuration File " + file.getName() + "is empty");
				Node source;
				Node target;
				for (String[] nextline : readIn) {
					if (nextline.length>1) {
						// check for Nodes; or create
						source=nodes.getNode(nextline[sourcecol].toUpperCase());
						target=nodes.getNode(nextline[targetcol].toUpperCase());
						
						if (nextline[relationcol].equals("has successor"))
							this.addEdge(source,target,nextline[relationcol],
									Double.parseDouble(nextline[orcol]),
									Double.parseDouble(nextline[betacol]),
									Double.parseDouble(nextline[pvalcol]),
									Double.parseDouble(nextline[number_relationscol]),
									Double.parseDouble(nextline[proportion_of_incidents_have_sourcecol]),
									Double.parseDouble(nextline[proportion_source_get_incidentscol]),
									Integer.parseInt(nextline[mean_agecol]));
						else 
							this.addEdge(source,target,nextline[relationcol]);
					}
				}
		    }
		}
	}
	
	
	
	public void addEdge(Node source, Node target, String relation) {
		Edge e = new Edge(source,target,relation);
		if (!edges_by_relation_target_source.containsKey(relation))
			edges_by_relation_target_source.put(relation, new HashMap<Node,HashMap<Node,Edge>>());
		if (!edges_by_relation_target_source.get(relation).containsKey(target))
			edges_by_relation_target_source.get(relation).put(target, new HashMap<Node,Edge>());
		edges_by_relation_target_source.get(relation).get(target).put(source, e);
		
	}
	
	public void addEdge(Node source, Node target, String relation,double or,double pvalue,double beta,double number_relations,double proportion_of_incidents_have_source,double proportion_source_get_incidents,int mean_age_of_incident_patients_with_condition_source) {
		this.addEdge(source, target, relation);
		Edge e = edges_by_relation_target_source.get(relation).get(target).get(source);
		e.or=or;
		e.pvalue=pvalue;
		e.beta=beta;
		e.number_relations=number_relations;
		e.proportion_of_incidents_have_source=proportion_of_incidents_have_source;
		e.proportion_source_get_incidents=mean_age_of_incident_patients_with_condition_source;
		e.mean_age_of_incident_patients_with_condition_source=mean_age_of_incident_patients_with_condition_source;
	}
	
	/*
	public ArrayList<Node> getConnectedNodes(Node node) {
		ArrayList<Node> nodes = new ArrayList<Node>();
		
		//add all sources for this target
		if (targetlist.containsKey(key)) {
			for (String addKey : this.targetlist.get(key).keySet())
				if (!addKey.equals(Consts.intercept)) nodes.add(addKey);
		}
		//add all targets for this source
		if (sourcelist.containsKey(key)) {
			for (String addKey : this.sourcelist.get(key).keySet())
				if (!addKey.equals(Consts.intercept)) nodes.add(addKey);
		}
		if (nodes.size()>0) nodes.add(key);
		return nodes;
	}
	
		
	public double getRisk(String target, HashMap<String,Double> features) {
		double coeffs;
		if (targetlist.get(target).get(Consts.intercept) != null) coeffs = targetlist.get(target).get(Consts.intercept).beta; //Math.log(targetlist.get(target).get(Consts.intercept).or);
		else coeffs=0.;
		for (String feature : features.keySet()) {
			if (targetlist.get(target).get(feature) != null)
				coeffs += features.get(feature) * targetlist.get(target).get(feature).beta; // Math.log(targetlist.get(target).get(feature).or); 
		}
		double odds = Math.exp(coeffs);
		double prob = odds / (1+odds);
		
		return prob;
	}
	
	public Double getOdds(String source, String target) {
		return targetlist.get(target).get(source).or;
	}
	
	public Double getOddsTransformed(String source, String target) {
		return targetlist.get(target).get(source).or_transformed;
	}
	
	public Double getPrevalence(String key) {
		//by source... any target will suffice
		if (key.equals(Consts.alterattribute)) return 1.;
		if (sourcelist.containsKey(key)) 
			return sourcelist.get(key).entrySet().iterator().next().getValue().prevalence_source;
		else return 0.;
	}
	
	public Double getIncidence(String key) {
		//by target... any source will suffice
		if (!targetlist.containsKey(key)) return 0.;
		return targetlist.get(key).entrySet().iterator().next().getValue().incidence_target;
	}
	
	
	public Double getIncidenceConditionSource(String source, String target) {
		if (!targetlist.containsKey(target) || !targetlist.get(target).containsKey(source)) return 0.;
		return targetlist.get(target).get(source).incidence_target_conditionSource;
	}
	
	public Double getMeanAgeIncidence(String key) {
		//by target... any source will suffice
		if (!targetlist.containsKey(key)) return 0.;
		return targetlist.get(key).entrySet().iterator().next().getValue().mean_age_incidence_target;
	}
	
	public Double getMeanAgeIncidenceConditionSource(String source, String target)  {
		//by target... any source will suffice
		if (!targetlist.containsKey(target) || !targetlist.get(target).containsKey(source)) return 0.;
		return targetlist.get(target).get(source).mean_age_incidence_target_conditionSource;
	}
	
	public Double getPvalue(String source, String target) {
		if (!targetlist.containsKey(target) || !targetlist.get(target).containsKey(source)) return 0.;
		return targetlist.get(target).get(source).pvalue;
	}
	
	
	public boolean isEdgeUnimportant(String source, String target) {
		if (!targetlist.containsKey(target) || !targetlist.get(target).containsKey(source)) return false;
		return targetlist.get(target).get(source).flag_toBeDeleted;
	}
	
	public boolean hasEdge (String source, String target) {
		return (sourcelist.containsKey(source) && sourcelist.get(source).containsKey(target));
	}*/

}
