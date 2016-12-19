package servlets;

import configuration.*;
import lists.NodeLabels;

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
	

	public static String label_path = Init.getWebInfPath() + "/graphdata_one/node_labels";
	public HashMap<String,String> mykeylists_eng = new HashMap<String,String>(); 
	public HashMap<String,String> mykeylists_de = new HashMap<String,String>(); 
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public Lists() {
        super();
        Gson gson = new Gson();
        NodeLabels labels = new NodeLabels();
        try {
        	labels.readInLists(label_path);
        } catch (Exception e) {
    		System.err.println("Fehler gefunden beim Einlesen der Konfiguration aus " + label_path);
    		System.err.println(e.getMessage());
    		e.printStackTrace();
    	}
        
        mykeylists_eng.put("ICD",gson.toJson(labels.getListByType("ICD", true)));
        mykeylists_de.put("ICD",gson.toJson(labels.getListByType("ICD", false)));
        mykeylists_eng.put("ATC",gson.toJson(labels.getListByType("ATC", true)));
        mykeylists_de.put("ATC",gson.toJson(labels.getListByType("ATC", false)));

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
			
			if (engl) 
				if (mykeylists_eng.get(list) != null)
					response.getWriter().append(mykeylists_eng.get(list));
				else 
					response.getWriter().append("{Unknown}");
			else 
				if (mykeylists_de.get(list) != null)
					response.getWriter().append(mykeylists_de.get(list));
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
