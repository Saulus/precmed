package configuration;
import java.net.URLDecoder;

/*
 * Init - class: provides path to Web-Inf
 * Use: String testdata_file_location = Init.getWebInfPath() + "/testdata.xml";
 */
public class Init {
    private static final String WEB_INF_DIR_NAME="WEB-INF";
    
    private static String web_inf_path;
    
    public static String getWebInfPath()  {
        if (web_inf_path == null) {
        	try {
        		web_inf_path = URLDecoder.decode(Init.class.getProtectionDomain().getCodeSource().getLocation().getPath(), "UTF8");
        	} catch (Exception e) {
        		System.err.println("Error initializing WEB-INF path");
    			e.printStackTrace();
    			web_inf_path="";
        	}
            web_inf_path=web_inf_path.substring(0,web_inf_path.lastIndexOf(WEB_INF_DIR_NAME)+WEB_INF_DIR_NAME.length());
        }
        return web_inf_path;
    }
}