package servlets;

import configuration.*;
import graph.CreateResult;
import graph.CreateResultDummy;
import graph.EdgeList;
import graph.Node;
import graph.NodeList;
import graph.TreeNode;
import lists.ClusterLabels;
import lists.NodeLabels;

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
	public String AGE;
	public String GENDER;
	public String COUNT_ATC;
	public String COUNT_ICD;
	public String HOSP;
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
	
	private NodeLabels nodelabels = new NodeLabels(); 
	private ClusterLabels clusterlabels = new ClusterLabels(); 
	private EdgeList edges = new EdgeList();
	private NodeList nodes = new NodeList();
	
	public static String label_path = Init.getWebInfPath() + "/graphdata_one/node_labels";
	public static String clusterFile = Init.getWebInfPath() + "/graphdata_one/cluster_and_types.csv";
	public static String edges_path = Init.getWebInfPath() + "/graphdata_one/edges";
	public static String nodesFile = Init.getWebInfPath() + "/graphdata_one/nodes.csv";
	
	private boolean hasError = false;
	
	
    /**
     * @see HttpServlet#HttpServlet()
     */
    public Graph() {
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
	
	private double parseFeature(String feature) {
		double val;
		try {
			val = Double.parseDouble(feature);
		} catch (Exception e) {
			System.err.println("Can not parse feature: "+feature);
			val=1.;
		}
		return val;
	}
	
	private double parseFeatureBoolean(String feature) {
		Boolean bool;
		double val=0;
		try {
			bool = Boolean.parseBoolean(feature);
			if (bool) val=1.;
		} catch (Exception e) {
			System.err.println("Can not parse feature: "+feature);
			val=0;
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
					HashMap<Node,Double> features = new HashMap<Node,Double>();
					HashMap<Node,Double> baseriskfeatures = new HashMap<Node,Double>();
					Gson gson = new Gson(); 
					String jsonString = "{}";
					boolean english=true;
					//int version=1;
					int topX = Consts.topX;
					//boolean graphview = false;
					
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
						//if (myrequest.view != null && myrequest.view.equals("GRAPH")) {
						//	graphview=true;
						//}
						
						//topX
						if (myrequest.topX != null) {
							topX=Integer.valueOf(myrequest.topX);
						}
						double val;
						
						//BUild features
							//Alter
							if (myrequest.AGE != null) {
								val = parseFeature(myrequest.AGE)/Consts.agescaler; //age is scaled by 5
								features.put(nodes.getNode(Consts.alterattribute), val );
								baseriskfeatures.put(nodes.getNode(Consts.alterattribute), val);
							}
							//geschlecht
							if (myrequest.GENDER != null) {
								val = parseFeature(myrequest.GENDER)-1; //Geschlecht is 0/1 coded, not 1/2
								features.put(nodes.getNode(Consts.geschlechtattribute), val );
								baseriskfeatures.put(nodes.getNode(Consts.geschlechtattribute), val);
							}
							if (myrequest.COUNT_ICD != null) {
								val = parseFeature(myrequest.COUNT_ICD);
								features.put(nodes.getNode(Consts.numberDISattribute), val );
							}
							if (myrequest.COUNT_ATC != null) {
								val = parseFeature(myrequest.COUNT_ATC);
								features.put(nodes.getNode(Consts.numberMEDattribute), val );
							}
							//HOSP
							if (myrequest.HOSP != null) {
								val = parseFeatureBoolean(myrequest.HOSP);
								if (val>0) features.put(nodes.getNode(Consts.hospattribute), val );
							}
							//atc
							for (int i=0; i<myrequest.ATC.length; i++) {
								features.put(nodes.getNode(myrequest.ATC[i]),1.);
							}
							//icd
							for (int i=0; i<myrequest.ICD.length; i++) {
								features.put(nodes.getNode(myrequest.ICD[i]),1.);
							}
					}
					
					//calc risk scores and make json
					CreateResult res = new CreateResult(nodes,edges,nodelabels,clusterlabels);
					res.createNodes(features,baseriskfeatures,english,topX);
					
					TreeNode result = new TreeNode("ROOT","Risks");
					TreeNode graphnode=res.graphNode(english);
					TreeNode listnode=res.listNode(english);
					result.add(graphnode.key,graphnode);
					result.add(listnode.key,listnode);
					String myresponse=gson.toJson(result);
					
					response.getWriter().append(myresponse);
				}
	}

}
