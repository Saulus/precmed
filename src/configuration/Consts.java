package configuration;


/**
Collected constants of general utility.
**/
public final class Consts {
	
	public static final String version = "1.1";
	
	public static final String medcsv= "atc5.csv";
	public static final String discsv= "icd3.csv";
	public static final String genkeycsv= "genkeys.csv";
	public static final String clustercsv= "cluster.csv";

	public static final String graphcsv= "graphdata.csv";
	
	public static final String alterattribute="AGE";
	public static final String geschlechtattribute="GENDER";
	public static final String numberMEDattribute="COUNT_ATC";
	public static final String numberDISattribute="COUNT_ICD";
	public static final String todattribute="DEATH";
	public static final String hospattribute="HOSP";
	public static final String intercept="INTERCEPT";
	//public static final String atcattribute="ATC";
	//public static final String icdattribute="ICD";
	
	public static final int topX = 20; //return only Top n risks 
	
	public static final int incidentYears = 4; //Year range for incidence (i.e. 2011-2015), used for scaling back
	
	
	
	public static final String knrcsv_de= "knrlist_de.csv";
	public static final String knrcsv_en= "knrlist_en.csv";
	public static final String knrclusterfile_de= "knrcluster_de.csv";
	public static final String knrclusterfile_en= "knrcluster_en.csv";
	
	public static final String demo_patients = "demo_patients.csv";	
	 /**
 	 * Instantiates a new consts.
 	 */
 	private Consts(){
		    //this prevents even the native class from 
		    //calling this ctor as well :
		    throw new AssertionError();
	 }
}
