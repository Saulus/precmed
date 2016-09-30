package graph;


public class Edge {
	public Node source;
	public Node target;
	
	public String relation;
	
	
	public double or=0;
	public double pvalue=0;
	public double beta=0.;
	public double number_relations=0;
	public double proportion_of_incidents_have_source=0;
	public double proportion_source_get_incidents=0;
	public int mean_age_of_incident_patients_with_condition_source=0;
	
	Edge(Node source, Node target, String relation) {
		this.source=source;
		this.target=target;
		this.relation=relation;
	}
	
	public boolean isIntercept () {
		return source.isIntercept();
	}
	

}
