package utils;

public class Utils {
	
	public Utils() {
		
	}
	
	public static double parseDouble(String s) {
		if (s==null || s.equals("") || s.equals("nan")) return 0;
		return Double.parseDouble(s);
	}
	
	public static int parseInt(String s) {
		if (s==null || s.equals("")) return 0;
		return Integer.parseInt(s);
	}

}
