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
		int prevalencecol=1;
		int incidencecol=2;
		int mean_age_incidencecol=3;
		int mean_age_prevalencecol=4;
		//and re-assign
		for (int i =0; i<headerline.length; i++) {
			if (headerline[i].equals("Node")) codecol=i;
			if (headerline[i].equals("prevalence")) prevalencecol=i;
			if (headerline[i].equals("incidence")) incidencecol=i;
			if (headerline[i].equals("Mean age of incident")) mean_age_incidencecol=i;
			if (headerline[i].equals("Mean age prevalence")) mean_age_prevalencecol=i;
		}
		if (readIn.size()==0 )
			throw new Exception("Configuration File " + file + "is empty");
		for (String[] nextline : readIn) {
			if (nextline.length>1) {
				this.addNode(readInNodeCode(nextline[codecol]),true,Utils.parseDouble(nextline[prevalencecol]),Utils.parseDouble(nextline[incidencecol]),Utils.parseInt(nextline[mean_age_incidencecol]),Utils.parseInt(nextline[mean_age_prevalencecol]));
			}
		}
	}
	
	private void addNode(String code, boolean code_is_readable) {
		if (!nodes.containsKey(code)) {
			Node n = new Node(code,code_is_readable);
			nodes.put(code,n);
		} else {
			nodes.get(code).setCode_readable(code_is_readable);
		}
	}
	
	private void addNode(String code, boolean code_is_readable, double prevalence, double incidence, int mean_age_incidence, int mean_age_prevalence) {
		if (!nodes.containsKey(code)) {
			Node n = new Node(code,code_is_readable,prevalence,incidence,mean_age_incidence,mean_age_prevalence);
			nodes.put(code,n);
		} else {
			nodes.get(code).setCode_readable(code_is_readable);
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
		if (!this.nodeExists(code)) this.addNode(code, false);
		return nodes.get(code);
	}
	
	public Collection<Node> getAllNodes() {
		return this.nodes.values();
	}

}
