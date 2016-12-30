package graph;

public class EdgeStatistics {
	
	public double or=0;
	public double pvalue=0;
	public double beta=0.;
	public double number_relations=0;
	public double proportion_of_incidents_have_source=0;
	public double proportion_source_get_incidents=0;
	public int mean_age_of_incident_patients_with_condition_source=0;
	public boolean isSignificant = false;
	
	public boolean isHighOdds = false; // to filter out unusual high odds ratios that rather hint to systemic irregularities
	
	public EdgeStatistics() {
		
	}

}
