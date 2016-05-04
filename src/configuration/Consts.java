package configuration;


/**
Collected constants of general utility.
**/
public final class Consts {
	
	public static final String version = "1.0";
	
	public static final String atccsv= "atc5.csv";
	public static final String icdcsv= "icd3.csv";
	public static final String clustercsv= "cluster.csv";

	public static final String graphcsv= "graphdata.csv";
	
	public static final String alterattributeOrig="ALTER";
	public static final String alterattribute="AGE";
	public static final String geschlechtattributeOrig="GESCHLECHT";
	public static final String geschlechtattribute="GENDER";
	public static final String numberATCattributeOrig="NUMBER_UNIQUE_ATC";
	public static final String numberATCattribute="COUNT_ATC";
	public static final String numberICDattributeOrig="NUMBER_UNIQUE_ICD";
	public static final String numberICDattribute="COUNT_ICD";
	public static final String intercept="(INTERCEPT)";
	//public static final String atcattribute="ATC";
	//public static final String icdattribute="ICD";
	
	public static final int topX = 20; //return only Top n risks 
	
	public static final int incidentYears = 5; //Year range for incidence (i.e. 2011-2015), used for scaling back
	
	
	
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
