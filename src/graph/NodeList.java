package graph;

import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;

import au.com.bytecode.opencsv.CSVReader;
import configuration.Consts;
import utils.Utils;

public class NodeList {
	private HashMap<String,Node> nodes = new HashMap<String,Node>();
	
	public NodeList () {
	}
	
		
	public static String readInNodeCode(String code_raw) {
		if (code_raw.contains(".")) {
			code_raw=code_raw.substring(0, code_raw.indexOf("."));
		}
		return code_raw.toUpperCase().replace(Consts.icdattribute, "").replace(Consts.atcattribute, "");
	}
	
	public void readInList(String file) throws Exception {
		Charset inputCharset = Charset.forName("ISO-8859-1");
		CSVReader reader = new CSVReader(new InputStreamReader(new FileInputStream(file), inputCharset), ';', '"'); //UTF-8?
		List<String[]> readIn = reader.readAll();
		reader.close();
		//assign colnumbers for columns needed
		String[] headerline = readIn.get(0);
		readIn.remove(0);
		int codecol=0;
		int alternative_codecol=0;
		int prevalencecol=1;
		int incidencecol=2;
		int mean_age_incidencecol=3;
		int mean_age_prevalencecol=4;
		//and re-assign
		for (int i =0; i<headerline.length; i++) {
			if (headerline[i].equals("Node")) codecol=i;
			if (headerline[i].equals("NodeCUI")) codecol=i;
			if (headerline[i].equals("prevalence")) prevalencecol=i;
			if (headerline[i].equals("incidence")) incidencecol=i;
			if (headerline[i].equals("Mean age of incident")) mean_age_incidencecol=i;
			if (headerline[i].equals("Mean age prevalence")) mean_age_prevalencecol=i;
		}
		if (readIn.size()==0 )
			throw new Exception("Configuration File " + file + "is empty");
		for (String[] nextline : readIn) {
			if (nextline.length>1) {
				this.addNode(readInNodeCode(nextline[codecol]),readInNodeCode(nextline[alternative_codecol]),Utils.parseDouble(nextline[prevalencecol]),Utils.parseDouble(nextline[incidencecol]),Utils.parseInt(nextline[mean_age_incidencecol]),Utils.parseInt(nextline[mean_age_prevalencecol]));
			}
		}
	}
	
	private void addNode(String readable_code, String alternative_code) {
		String code=Node.decideCode(readable_code,alternative_code);
		if (!nodes.containsKey(code)) {
			Node n = new Node(readable_code,alternative_code);
			nodes.put(code,n);
		} 
	}
	
	private void addNode(String readable_code, String alternative_code, double prevalence, double incidence, int mean_age_incidence, int mean_age_prevalence) {
		String code=Node.decideCode(readable_code,alternative_code);
		if (!nodes.containsKey(code)) {
			Node n = new Node(readable_code,alternative_code,prevalence,incidence,mean_age_incidence,mean_age_prevalence);
			nodes.put(code,n);
		} else {
			nodes.get(code).setPrevalence(prevalence);
			nodes.get(code).setIncidence(incidence);
			nodes.get(code).setMean_age_incidence(mean_age_incidence);
			nodes.get(code).setMean_age_prevalence(mean_age_prevalence);
		}
	}
	
	
	public boolean nodeExists(String code) {
		return nodes.containsKey(code);
	}
	
	public Node getNode(String code) {
		if (!this.nodeExists(code)) this.addNode(code, "");
		return nodes.get(code);
	}
	
	public Node getNode(String readable_code, String alternative_code) {
		String code=Node.decideCode(readable_code,alternative_code);
		if (!this.nodeExists(code)) this.addNode(readable_code, alternative_code);
		return nodes.get(code);
	}
	
	public Collection<Node> getAllNodes() {
		return this.nodes.values();
	}

}
