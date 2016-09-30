package graph;

import configuration.Consts;

public class Node {
	private String code;
	private boolean code_is_readable; //ICD or ATC (not UMLS)
	
	private double prevalence = 0;
	private double incidence = 0;
	private int mean_age_incidence = 0;
	private int mean_age_prevalence = 0;
	
	public Node(String code, boolean code_is_readable) {
		this.setCode(code);
		this.setCode_readable(code_is_readable);
	}
	
	public Node(String code, boolean code_is_readable, double prevalence, double incidence, int mean_age_incidence, int mean_age_prevalence) {
		this.setCode(code);
		this.setCode_readable(code_is_readable);
		this.setPrevalence(prevalence);
		this.setIncidence(incidence);
		this.setMean_age_incidence(mean_age_incidence);
		this.setMean_age_prevalence(mean_age_prevalence);
	}

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}


	public boolean isCode_readable() {
		return code_is_readable;
	}

	public void setCode_readable(boolean code_is_readable) {
		this.code_is_readable = code_is_readable;
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
