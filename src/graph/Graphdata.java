package graph;

import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Random;
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
		String[] headerline = readIn.get(0);
		readIn.remove(0);
		//assign colnumbers for columns needed
		Integer sourceCol=0;
		Integer targetCol=1;
		Integer oddsCol=2;
		Integer oddsTransformedCol=3;
		Integer prevalence_sourceCol=5;
		Integer incidence_targetCol=6;
		Integer incidence_target_conditionSourceCol=7;
		Integer mean_age_incidence_targetCol=8;
		Integer mean_age_incidence_target_conditionSourceCol=9;
		Integer pvalueCol=10;
		//Integer flag_toBeDeletedCol=10;
		Integer aucCol=10;
		Integer ppv1Col=10;
		Integer betaCol=10;
		//and re-assign
		for (int i =0; i<headerline.length; i++) {
			if (headerline[i].equals("Source")) sourceCol=i;
			if (headerline[i].equals("Target")) targetCol=i;
			if (headerline[i].equals("OR")) oddsCol=i;
			if (headerline[i].equals("p-value")) pvalueCol=i;
			if (headerline[i].equals("OR transformed")) oddsTransformedCol=i;
			if (headerline[i].equals("prevalence Source")) prevalence_sourceCol=i;
			if (headerline[i].equals("incidence Target")) incidence_targetCol=i;
			if (headerline[i].equals("incidence Target Source")) incidence_target_conditionSourceCol=i;
			if (headerline[i].equals("Mean age of incident patients")) mean_age_incidence_targetCol=i;
			if (headerline[i].equals("Mean age of incident patients with Condition Source")) mean_age_incidence_target_conditionSourceCol=i;
			if (headerline[i].equals("betas")) betaCol=i;
			if (headerline[i].equals("AUC test set")) aucCol=i;
			if (headerline[i].equals("PPV 1%")) ppv1Col=i;
		}
		if (readIn.size()==0 )
			throw new Exception("Configuration File is empty");
		Edge edge;
		//Dheban - remove
		/*Random randomGenerator = new Random();
		int r_start = 2;
		int r_end=3;
		int range = r_end - r_start + 1;
		double fraction;
		double newor;
		*/
		for (String[] nextline : readIn) {
			if (!nextline[sourceCol].isEmpty()) {
				edge = new Edge();
				edge.source=nextline[sourceCol].toUpperCase();
				if (edge.source.equals(Consts.geschlechtattributeOrig)) edge.source=Consts.geschlechtattribute;
				if (edge.source.equals(Consts.alterattributeOrig)) edge.source=Consts.alterattribute;
				if (edge.source.equals(Consts.numberMEDattributeOrig)) edge.source=Consts.numberMEDattribute;
				if (edge.source.equals(Consts.numberDISattributeOrig)) edge.source=Consts.numberDISattribute;
				edge.target=nextline[targetCol].toUpperCase();
				if (edge.target.equals(Consts.todattributeOrig)) edge.target=Consts.todattribute;
				try {edge.or=Double.parseDouble(nextline[oddsCol]);} catch (Exception e) {}
				try {edge.pvalue=Double.parseDouble(nextline[pvalueCol]);} catch (Exception e) {}
				try {edge.or_transformed=Double.parseDouble(nextline[oddsTransformedCol]);} catch (Exception e) {}
				try {edge.prevalence_source=Double.parseDouble(nextline[prevalence_sourceCol]);} catch (Exception e) {}
				try {edge.incidence_target=Double.parseDouble(nextline[incidence_targetCol])/Consts.incidentYears;} catch (Exception e) {}
				try {edge.incidence_target_conditionSource=Double.parseDouble(nextline[incidence_target_conditionSourceCol])/Consts.incidentYears;} catch (Exception e) {}
				try {edge.mean_age_incidence_target=Double.parseDouble(nextline[mean_age_incidence_targetCol]);} catch (Exception e) {}
				try {edge.mean_age_incidence_target_conditionSource=Double.parseDouble(nextline[mean_age_incidence_target_conditionSourceCol]);} catch (Exception e) {}
				//edge.flag_toBeDeleted=!nextline[flag_toBeDeletedCol].isEmpty();
				try {edge.auc=Double.parseDouble(nextline[aucCol]);} catch (Exception e) {}
				try {edge.ppv1=Double.parseDouble(nextline[ppv1Col]);} catch (Exception e) {}
				try {edge.beta=Double.parseDouble(nextline[betaCol]);} catch (Exception e) {}
			
				/*
				//the follwing is just for mitigating Dhebans errors: ORs too high (because of downsampling), betas missing
				if (edge.or>r_end && !edge.source.equals(Consts.geschlechtattribute) && !edge.source.equals(Consts.intercept)){
					 fraction = range * randomGenerator.nextDouble();
					 newor = fraction + r_start;
					 edge.or=newor;
				}
				if (edge.beta==0)
					edge.beta=Math.log(edge.or);
				//verify edge -> do not include models with tst AUC < 0.6
				if (edge.auc >= 0.55 && edge.incidence_target>=0.0002)
					mylist.add(edge);
				*/
				mylist.add(edge);
			}
		}
		//scaleOdds(mylist);
		return mylist;
	}
	
	//sclaes odds between 0 and 1 
	/*
	private void scaleOdds (ArrayList<Edge> edgelist) {
		double min=0;
		double max=0;
		for (Edge edge : edgelist) {
			if (edge.or<min) min = edge.or;
			if (edge.or>max) max = edge.or;
		}
		for (Edge edge : edgelist) {
			edge.oddsScaled=(edge.weight-min)/(max-min);
		}
	}*/
	
	public Set<String> getTargetList() {
		return this.targetlist.keySet();
	}
	
	public ArrayList<String> getConnectedNodes(String key) {
		ArrayList<String> nodes = new ArrayList<String>();
		
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
	}
	
}
