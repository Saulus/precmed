package graph;

import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Set;

import au.com.bytecode.opencsv.CSVReader;
import configuration.Consts;

public class Graphdata {
	private ArrayList<Edge> edgelist; 
	private HashMap<String,HashMap<String,Edge>> targetlist = new HashMap<String,HashMap<String,Edge>>();
	private HashMap<String,HashMap<String,Edge>> sourcelist = new HashMap<String,HashMap<String,Edge>>();
	
	public Graphdata (String path) throws Exception {
		edgelist=readInList(path);
		
		for (Edge edge : edgelist) {
			//source
			if (sourcelist.get(edge.source) == null) sourcelist.put(edge.source, new HashMap<String,Edge>());
			sourcelist.get(edge.source).put(edge.target,edge);
			//target
			if (targetlist.get(edge.target) == null) targetlist.put(edge.target, new HashMap<String,Edge>());
			targetlist.get(edge.target).put(edge.source,edge);
		}
	}
	
	public ArrayList<Edge> readInList(String file) throws Exception {
		ArrayList<Edge>  mylist = new ArrayList<Edge>();
		Charset inputCharset = Charset.forName("ISO-8859-1");
		CSVReader reader = new CSVReader(new InputStreamReader(new FileInputStream(file), inputCharset), ',', '"'); //UTF-8?
		List<String[]> readIn = reader.readAll();
		reader.close();
		//first line = header-line
		//String[] headerline = readIn.get(0);
		//assign colnumbers for columns needed
		Integer sourceCol=0;
		Integer targetCol=1;
		Integer weightCol=2;
		Integer weight_originalCol=3;
		Integer prevalence_sourceCol=5;
		Integer incidence_targetCol=6;
		Integer incidence_target_conditionSourceCol=7;
		Integer mean_age_incidence_targetCol=8;
		Integer mean_age_incidence_target_conditionSourceCol=9;
		Integer flag_toBeDeletedCol=10;
		readIn.remove(0);
		if (readIn.size()==0 )
			throw new Exception("Configuration File is empty");
		Edge edge;
		for (String[] nextline : readIn) {
			if (!nextline[sourceCol].isEmpty()) {
				edge = new Edge();
				edge.source=nextline[sourceCol].toUpperCase();
				edge.target=nextline[targetCol].toUpperCase();
				edge.weight=Double.parseDouble(nextline[weightCol]);
				edge.weight_original=Double.parseDouble(nextline[weight_originalCol]);
				edge.prevalence_source=Double.parseDouble(nextline[prevalence_sourceCol]);
				edge.incidence_target=Double.parseDouble(nextline[incidence_targetCol]);
				edge.incidence_target_conditionSource=Double.parseDouble(nextline[incidence_target_conditionSourceCol]);
				edge.mean_age_incidence_target=Double.parseDouble(nextline[mean_age_incidence_targetCol]);
				edge.mean_age_incidence_target_conditionSource=Double.parseDouble(nextline[mean_age_incidence_target_conditionSourceCol]);
				edge.flag_toBeDeleted=!nextline[flag_toBeDeletedCol].isEmpty();
				mylist.add(edge);
			}
		}
		scaleOdds(mylist);
		return mylist;
	}
	
	//sclaes odds between 0 and 1
	private void scaleOdds (ArrayList<Edge> edgelist) {
		double min=0;
		double max=0;
		for (Edge edge : edgelist) {
			if (edge.weight<min) min = edge.weight;
			if (edge.weight>max) max = edge.weight;
		}
		for (Edge edge : edgelist) {
			edge.oddsScaled=(edge.weight-min)/(max-min);
		}
	}
	
	public Set<String> getTargetList() {
		return this.targetlist.keySet();
	}
	
		
	public Double getRisk(String target, HashMap<String,Double> features) {
		Double log_odds;
		if (targetlist.get(target).get(Consts.intercept) != null) log_odds =  targetlist.get(target).get(Consts.intercept).weight_original;
		else log_odds=0.;
		for (String feature : features.keySet()) {
			if (targetlist.get(target).get(feature) != null)
				log_odds += features.get(feature) * targetlist.get(target).get(feature).weight_original; 
		}
		Double odds = Math.exp(log_odds);
		Double prob = odds / (1+odds);
		
		return prob;
	}
	
	public Double getOdds(String source, String target) {
		return targetlist.get(target).get(source).weight;
	}
	
	public Double getOddsScaled(String source, String target) {
		return targetlist.get(target).get(source).oddsScaled;
	}
	
	public Double getPrevalence(String key) {
		//by source... any target will suffice
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
	
	public boolean isEdgeUnimportant(String source, String target) {
		if (!targetlist.containsKey(target) || !targetlist.get(target).containsKey(source)) return false;
		return targetlist.get(target).get(source).flag_toBeDeleted;
	}
	
	public boolean hasEdge (String source, String target) {
		return (sourcelist.containsKey(source) && sourcelist.get(source).containsKey(target));
	}
	
}
