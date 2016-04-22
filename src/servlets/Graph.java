package servlets;

import configuration.*;
import graph.CreateResult;
import graph.Graphdata;
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


class RequestSet {
	public String ALTER;
	public String GESCHLECHT;
	public String[] ICD;
	public String[] ATC;
	
	public String view; //GRAPH or RISKS
	public String lang;//EN or DE
	//public String version;
	public String topX; 
	
	public RequestSet() {
		
	}
	
	
}



/**
 * Servlet implementation class Risks
 * 
 * h2o classes go into: /WEB-INF/classes/
 * allmodels.csv goes into: /WEB-INF/allmodels.csv 
 */
@WebServlet("/Graph")
public class Graph extends HttpServlet {
	private static final long serialVersionUID = 1L;
	
	private AList icdlist;
	private AList atclist;
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
    public Graph() {
        super();
        Gson gson = new Gson();
        
        //read in lists
        try {
        	icdlist=new AList(Lists.icdlistFile,new ListTypeKonfigICD(),gson);
        } catch (Exception e) {
    		System.err.println("Fehler gefunden beim Einlesen der Konfiguration aus Datei " + Lists.icdlistFile);
    		e.printStackTrace();
    		this.hasError=true;
    	}
        
        try {
        	atclist=new AList(Lists.atclistFile,new ListTypeKonfigATC(),gson);
        } catch (Exception e) {
    		System.err.println("Fehler gefunden beim Einlesen der Konfiguration aus Datei " + Lists.atclistFile);
    		e.printStackTrace();
    		this.hasError=true;
    	}
        
        try {
        	clusterlist=new AList(Lists.clusterlistFile,new ListTypeKonfigCluster(),gson);
        } catch (Exception e) {
    		System.err.println("Fehler gefunden beim Einlesen der Konfiguration aus Datei " + Lists.clusterlistFile);
    		e.printStackTrace();
    		this.hasError=true;
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
	
	private Double parseFeature(String feature) {
		Double val;
		try {
			val = Double.parseDouble(feature);
		} catch (Exception e) {
			System.err.println("Can not parse feature: "+feature);
			val=1.;
		}
		return val;
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
					HashMap<String,Double> features = new HashMap<String,Double>();
					Gson gson = new Gson(); 
					String jsonString = "{}";
					boolean english=true;
					//int version=1;
					int topX = Consts.topX;
					boolean graphview = false;
					
					if ("POST".equalsIgnoreCase(request.getMethod())) {
						jsonString = request.getReader().lines().collect(Collectors.joining(System.lineSeparator()));

						RequestSet myrequest =  gson.fromJson(jsonString, RequestSet.class);
						
						//lang
						if (myrequest.lang != null && myrequest.lang.equals("DE")) 
							english=false;
						
						/*//response version
						if (myrequest.version != null) {
							version=Integer.valueOf(myrequest.version);
						}*/
						
						//view; //GRAPH or RISKS
						if (myrequest.view != null && myrequest.view.equals("GRAPH")) {
							graphview=true;
						}
						
						//topX
						if (myrequest.topX != null) {
							topX=Integer.valueOf(myrequest.topX);
						}
						
						//BUild features
							//Alter
							if (myrequest.ALTER != null)
								features.put(Consts.alterattribute, parseFeature(myrequest.ALTER));
							//geschlecht
							if (myrequest.GESCHLECHT != null)
								features.put(Consts.geschlechtattribute, parseFeature(myrequest.GESCHLECHT));
							//atc
							for (int i=0; i<myrequest.ATC.length; i++) {
								features.put(myrequest.ATC[i],1.);
							}
							//icd
							for (int i=0; i<myrequest.ICD.length; i++) {
								features.put(myrequest.ICD[i],1.);
							}
					}
					
					//calc risk scores and make json
					CreateResult res = new CreateResult(topX,icdlist,atclist,clusterlist);
					res.calc(graph, features,english);
					
					String myresponse;
					if (graphview) 
						myresponse = res.graphJson(gson, english,graph, features);
					else myresponse = res.riskJson(gson, english);
					
					response.getWriter().append(myresponse);
				}
	}

}
