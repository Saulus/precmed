package servlets;

import configuration.*;
import graph.CreateResult;
import graph.Graphdata;
import graph.TreeNode;
import lists.AList;

import java.io.IOException;
import java.util.HashMap;
import java.util.stream.Collectors;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;


class RequestSetSingle {
	public String KEY;
	
	public String lang;//EN or DE
	
	
	public RequestSetSingle() {
		
	}
	
	
}



/**
 * Servlet implementation class Risks
 * 
 * h2o classes go into: /WEB-INF/classes/
 * allmodels.csv goes into: /WEB-INF/allmodels.csv 
 */
@WebServlet("/Single")
public class Single extends HttpServlet {
	private static final long serialVersionUID = 1L;
	
	private HashMap<String,AList> mykeylists = new HashMap<String,AList>(); 
	private AList clusterlist;
	
	public static String graphFile = Init.getWebInfPath() + "/"+Consts.graphcsv;
	private Graphdata graph;
	
	private boolean hasError = false;
	
	/*
	private Calculationv1 calcv1 = new Calculationv1();
	private Calculationv2 calcv2 = new Calculationv2();*/
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public Single() {
        super();
        Gson gson = new Gson();
        
        //read in lists
        try {
        	mykeylists.put("MED",new AList(Lists.medlistFile,new ListTypeKonfigICD(),gson));
        } catch (Exception e) {
    		System.err.println("Fehler gefunden beim Einlesen der Konfiguration aus Datei " + Lists.medlistFile);
    		e.printStackTrace();
    	}
        
        try {
        	mykeylists.put("DIS",new AList(Lists.dislistFile,new ListTypeKonfigATC(),gson));
        } catch (Exception e) {
    		System.err.println("Fehler gefunden beim Einlesen der Konfiguration aus Datei " + Lists.dislistFile);
    		e.printStackTrace();
    	}
        
        try {
        	mykeylists.put("GEN",new AList(Lists.genlistFile,new ListTypeKonfigOTHER(),gson));
       } catch (Exception e) {
   		System.err.println("Fehler gefunden beim Einlesen der Konfiguration aus Datei " + Lists.genlistFile);
   		e.printStackTrace();
       }
        
        try {
        	clusterlist = new AList(Lists.clusterlistFile,new ListTypeKonfigCluster(),gson);
        } catch (Exception e) {
    		System.err.println("Fehler gefunden beim Einlesen der Konfiguration aus Datei " + Lists.clusterlistFile);
    		e.printStackTrace();
    	}
        
        
        //Read in graphdata
        try {
        	graph=new Graphdata(graphFile);
        } catch (Exception e) {
    		System.err.println("Fehler gefunden beim Einlesen der Konfiguration aus Datei " + graphFile);
    		e.printStackTrace();
    		this.hasError=true;
    	}
        
	        
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doPost(request, response);
	}
	
	

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		//expects the following attributes (max):
				//Lists ambulant: knr=(1,2,8), Lists stationär: kh_knr=(9,10), ATC: atc=(AA2BB,AB4GF), alter=57, Geschlecht=2
				response.addHeader("Access-Control-Allow-Origin", "*");
				response.addHeader("Content-Type", "application/json");
				response.setCharacterEncoding("UTF-8");
				
				if (hasError) response.sendError(520, "Init-Fehler");
				else {
					Gson gson = new Gson(); 
					String jsonString = "{}";
					boolean english=true;
					String key ="";
					//int version=1;
					
					
					if ("POST".equalsIgnoreCase(request.getMethod())) {
						jsonString = request.getReader().lines().collect(Collectors.joining(System.lineSeparator()));

						RequestSetSingle myrequest =  gson.fromJson(jsonString, RequestSetSingle.class);
						
						//lang
						if (myrequest.lang != null && myrequest.lang.equals("DE")) 
							english=false;
						
						//key
						if (myrequest.KEY != null) key = myrequest.KEY;
					}
					
					//calc risk scores and make json
					CreateResult res = new CreateResult(mykeylists, clusterlist);
					res.calcSingleNodeList(graph, key, english);
					
					TreeNode result = res.singleNode(graph);
					String myresponse=gson.toJson(result);
					
					response.getWriter().append(myresponse);
				}
	}

}
