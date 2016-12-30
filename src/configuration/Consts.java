package configuration;


/**
Collected constants of general utility.
**/
public final class Consts {
	
	public static final String version = "3.0b";
	
	
	public static final String alterattribute="AGE";
	public static final String geschlechtattribute="GENDER";
	public static final String numberMEDattribute="COUNT_ATC";
	public static final String numberDISattribute="COUNT_ICD";
	public static final String todattribute="DEATH";
	public static final String hospattribute="HOSP";
	public static final String intercept="INTERCEPT";
	public static final String atcattribute="ATC_";
	public static final String icdattribute="ICD_";
	public static final String icdgroupattribute="ICG_";
	
	public static final int topX = 3; //return only Top n risks 
	public static final int maxOdds = 5; // to filter out unusual high odds ratios that rather hint to systemic irregularities
	
	public static final String riskRelationName = "has_successor";
	
	public static final String generalStatisticsGraph = "general";
	
	
	public static final String demo_patients = "demo_patients.csv";	
	
	public static final String femaleCUI="C0015780";
	public static final String maleCUI="C0024554";
	
	 /**
 	 * Instantiates a new consts.
 	 */
 	private Consts(){
		    //this prevents even the native class from 
		    //calling this ctor as well :
		    throw new AssertionError();
	 }
}
