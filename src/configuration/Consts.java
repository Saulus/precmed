package configuration;


/**
Collected constants of general utility.
**/
public final class Consts {
	
	public static final String version = "2.0";
	
	
	public static final String alterattribute="AGE";
	public static final String geschlechtattribute="GENDER";
	public static final String numberMEDattribute="COUNT_ATC";
	public static final String numberDISattribute="COUNT_ICD";
	public static final String todattribute="DEATH";
	public static final String hospattribute="HOSP";
	public static final String intercept="INTERCEPT";
	public static final String atcattribute="ATC_";
	public static final String icdattribute="ICD_";
	
	public static final int topX = 3; //return only Top n risks 
	
	public static final int incidentYears = 4; //Year range for incidence (i.e. 2011-2015), used for scaling back
	
	public static final String riskRelationName = "has_successor";
	
	
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
