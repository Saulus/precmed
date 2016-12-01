package graph;

import java.util.HashMap;

import configuration.Consts;


public class Node {
	private String code; //ICD or ATC (not UMLS)
	private String alternative_code; //UMLS 
	
	private HashMap<String,NodeStatistics> nodeinfo = new HashMap<String,NodeStatistics>(); //graphname -> info 
	
	
	public Node(String readable_code, String alternative_code) {
		this.code=decideCode(readable_code,alternative_code);
		this.alternative_code=alternative_code;
	}
	
		
	public void addStatistics (String graphname, double prevalence, double incidence, int mean_age_incidence, int mean_age_prevalence) {
		if (!this.nodeinfo.containsKey(graphname)) {
			nodeinfo.put(graphname,new NodeStatistics());
		}
		this.setPrevalence(graphname,prevalence);
		this.setIncidence(graphname,incidence);
		this.setMean_age_incidence(graphname,mean_age_incidence);
		this.setMean_age_prevalence(graphname,mean_age_prevalence);
	}
	
	public static String decideCode(String readable_code, String alternative_code) {
		if (readable_code.isEmpty()) return alternative_code;
		else return readable_code;
	}

	public String getCode() {
		return code;
	}


	public NodeStatistics getNodeStatistics(String graphname) {
		//decide in which statistics to return
		//return nodeinfo.get(graphname);
		if (nodeinfo.containsKey(Consts.generalStatisticsGraph))
			return nodeinfo.get(Consts.generalStatisticsGraph);
		return null;
	}

	public double getPrevalence(String graphname) {
		return nodeinfo.get(graphname).prevalence;
	}

	public void setPrevalence(String graphname,double prevalence) {
		nodeinfo.get(graphname).prevalence = prevalence;
	}

	public double getIncidence(String graphname) {
		return nodeinfo.get(graphname).incidence;
	}

	public void setIncidence(String graphname,double incidence) {
		nodeinfo.get(graphname).incidence = incidence;
	}

	public int getMean_age_incidence(String graphname) {
		return nodeinfo.get(graphname).mean_age_incidence;
	}

	public void setMean_age_incidence(String graphname,int mean_age_incidence) {
		nodeinfo.get(graphname).mean_age_incidence = mean_age_incidence;
	}

	public int getMean_age_prevalence(String graphname) {
		return nodeinfo.get(graphname).mean_age_prevalence;
	}

	public void setMean_age_prevalence(String graphname,int mean_age_prevalence) {
		nodeinfo.get(graphname).mean_age_prevalence = mean_age_prevalence;
	}
	
	public boolean isIntercept() {
		return code.equals(Consts.intercept);
	}
	
	


}
