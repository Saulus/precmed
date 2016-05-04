package graph;

import configuration.Consts;

public class Edge {
	public String source;
	public String target;
	public double or=0;
	public double pvalue=0;
	public double or_transformed=0;
	public double beta=0.;
	public double prevalence_source=0;
	public double incidence_target=0;
	public double incidence_target_conditionSource=0;
	public double mean_age_incidence_target=0;
	public double mean_age_incidence_target_conditionSource=0;
	public boolean flag_toBeDeleted = false;
	public double auc=0.;
	public double ppv1=0.;
	
	Edge() {}
	
	public boolean isIntercept () {
		if (source.equals(Consts.intercept)) return true;
		return false;
	}

}
