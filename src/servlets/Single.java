package servlets;

import configuration.*;
import graph.CreateResult;
import graph.EdgeList;
import graph.NodeList;
import graph.TreeNode;
import lists.ClusterLabels;
import lists.NodeLabels;

import java.io.IOException;
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
	
	private NodeLabels nodelabels = new NodeLabels(); 
	private ClusterLabels clusterlabels = new ClusterLabels(); 
	private EdgeList edges = new EdgeList();
	private NodeList nodes = new NodeList();
	
	public static String label_path = Init.getWebInfPath() + "/graphdata/node_labels";
	public static String clusterFile = Init.getWebInfPath() + "/graphdata/cluster_and_types.csv";
	public static String edges_path = Init.getWebInfPath() + "/graphdata/edges";
	public static String nodesFile = Init.getWebInfPath() + "/graphdata/nodes.csv";
	
	private boolean hasError = false;
	
	
	/*
	private Calculationv1 calcv1 = new Calculationv1();
	private Calculationv2 calcv2 = new Calculationv2();*/
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public Single() {
        super();
        //Read in lists
        
        try {
        	nodelabels.readInLists(label_path);
        } catch (Exception e) {
    		System.err.println("Fehler gefunden beim Einlesen der Konfiguration aus " + label_path);
    		System.err.println(e.getMessage());
    		e.printStackTrace();
    	}
        
        try {
        	clusterlabels.readInList(clusterFile);
        } catch (Exception e) {
    		System.err.println("Fehler gefunden beim Einlesen der Konfiguration aus " + clusterFile);
    		System.err.println(e.getMessage());
    		e.printStackTrace();
    	}
        
      //Read in graphdata
        try {
        	nodes.readInList(nodesFile);
        } catch (Exception e) {
    		System.err.println("Fehler gefunden beim Einlesen der Konfiguration aus " + nodesFile);
    		System.err.println(e.getMessage());
    		e.printStackTrace();
    	}
        
        try {
        	edges.readInLists(edges_path, nodes);
        } catch (Exception e) {
    		System.err.println("Fehler gefunden beim Einlesen der Konfiguration aus " + edges_path);
    		System.err.println(e.getMessage());
    		e.printStackTrace();
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
					CreateResult res = new CreateResult(nodes,edges,nodelabels,clusterlabels);
					res.calcSingleNodeList(key, english);
					TreeNode result = res.singleNode(english);
					
					String myresponse=gson.toJson(result);
					
					response.getWriter().append(myresponse);
				}
	}

}
