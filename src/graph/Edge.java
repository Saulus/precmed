package graph;

import configuration.Consts;

public class Edge {
	public String source;
	public String target;
	public double weight;
	public double weight_original;
	public double prevalence_source;
	public double incidence_target;
	public double incidence_target_conditionSource ;
	public double mean_age_incidence_target;
	public double mean_age_incidence_target_conditionSource ;
	public boolean flag_toBeDeleted ;
	
	public double oddsScaled;
	
	Edge() {}
	
	public boolean isIntercept () {
		if (source.equals(Consts.intercept)) return true;
		return false;
	}

}
