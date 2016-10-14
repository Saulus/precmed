package graph;

import configuration.Consts;

public class Node {
	private String code; //ICD or ATC (not UMLS)
	private String alternative_code; //UMLS 
	
	private double prevalence = 0;
	private double incidence = 0;
	private int mean_age_incidence = 0;
	private int mean_age_prevalence = 0;
	
	public Node(String readable_code, String alternative_code) {
		this.code=decideCode(readable_code,alternative_code);
		this.alternative_code=alternative_code;
	}
	
	public Node(String readable_code, String alternative_code, double prevalence, double incidence, int mean_age_incidence, int mean_age_prevalence) {
		this.code=decideCode(readable_code,alternative_code);
		this.alternative_code=alternative_code;
		this.setPrevalence(prevalence);
		this.setIncidence(incidence);
		this.setMean_age_incidence(mean_age_incidence);
		this.setMean_age_prevalence(mean_age_prevalence);
	}
	
	public static String decideCode(String readable_code, String alternative_code) {
		if (readable_code.isEmpty()) return alternative_code;
		else return readable_code;
	}

	public String getCode() {
		return code;
	}



	public double getPrevalence() {
		return prevalence;
	}

	public void setPrevalence(double prevalence) {
		this.prevalence = prevalence;
	}

	public double getIncidence() {
		return incidence;
	}

	public void setIncidence(double incidence) {
		this.incidence = incidence;
	}

	public int getMean_age_incidence() {
		return mean_age_incidence;
	}

	public void setMean_age_incidence(int mean_age_incidence) {
		this.mean_age_incidence = mean_age_incidence;
	}

	public int getMean_age_prevalence() {
		return mean_age_prevalence;
	}

	public void setMean_age_prevalence(int mean_age_prevalence) {
		this.mean_age_prevalence = mean_age_prevalence;
	}
	
	public boolean isIntercept() {
		return code.equals(Consts.intercept);
	}


}
