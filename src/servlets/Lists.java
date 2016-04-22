package servlets;

import configuration.*;
import lists.AList;

import java.io.IOException;
import java.util.HashMap;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;




/**
 * Servlet implementation class Risks
 * 
 * h2o classes go into: /WEB-INF/classes/
 * allmodels.csv goes into: /WEB-INF/allmodels.csv 
 */
@WebServlet("/Lists")
public class Lists extends HttpServlet {
	
	private static final long serialVersionUID = 1L;
	

	public static String icdlistFile = Init.getWebInfPath() + "/"+Consts.icdcsv;
	public static String atclistFile = Init.getWebInfPath() + "/"+Consts.atccsv;
	public static String clusterlistFile = Init.getWebInfPath() + "/"+Consts.clustercsv;
	
	public HashMap<String,AList> mylists = new HashMap<String,AList>(); 
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public Lists() {
        super();
        Gson gson = new Gson();
        try {
	        mylists.put("ICD",new AList(icdlistFile,new ListTypeKonfigICD(),gson));
        } catch (Exception e) {
    		System.err.println("Fehler gefunden beim Einlesen der Konfiguration aus Datei " + icdlistFile);
    		e.printStackTrace();
    	}
        
        try {
        	 mylists.put("ATC",new AList(atclistFile,new ListTypeKonfigATC(),gson));
        } catch (Exception e) {
    		System.err.println("Fehler gefunden beim Einlesen der Konfiguration aus Datei " + atclistFile);
    		e.printStackTrace();
    	}
        
        try {
        	mylists.put("cluster",new AList(clusterlistFile,new ListTypeKonfigCluster(),gson));
        } catch (Exception e) {
    		System.err.println("Fehler gefunden beim Einlesen der Konfiguration aus Datei " + clusterlistFile);
    		e.printStackTrace();
    	}

    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		response.addHeader("Access-Control-Allow-Origin", "*");
		response.addHeader("Content-Type", "application/json");
		response.setCharacterEncoding("UTF-8");
		
		//if (hasError) response.sendError(520, "Init-Fehler");
		//else {
			String list = request.getParameter("list");
			String lang = request.getParameter("lang");
			boolean engl = true;
			if (lang != null && lang.equals("DE")) engl=false;
			
			if (mylists.get(list) != null)
				response.getWriter().append(mylists.get(list).getJson(engl));
			else 
				response.getWriter().append("{Unknown}");
		//}
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		doGet(request, response);
	}
	
	
	

}
