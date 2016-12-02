package lists;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import au.com.bytecode.opencsv.CSVReader;
import graph.MedicalGraph;
import graph.Node;

class NodeInfo {
	public String code;
	public String label_de;
	public String label_eng; 
	public String typekey;
	public String clusterkey;
	
	public NodeInfo (String code, String de, String eng, String typekey, String clusterkey) {
		this.code=code;
		this.label_de=de;
		this.label_eng=eng;
		this.typekey=typekey;
		this.clusterkey=clusterkey;
	}
}

public class NodeLabels {
	
	private HashMap<String,NodeInfo> nodes_by_code = new HashMap<String,NodeInfo>();
	
	public NodeLabels() {
		
	}
	
	public void readInLists(String path) throws Exception {
		Charset inputCharset = Charset.forName("ISO-8859-1");
		File[] files = new File(path).listFiles();
		//If this pathname does not denote a directory, then listFiles() returns null. 
		
		String labelpre;
		String code;
		String labelde="";
		String labelen="";
		String cluster="";
		boolean addPrefix2Label;

		for (File file : files) {
		    if (file.isFile()) {
		    	addPrefix2Label= file.getName().contains("addcode");
		    	CSVReader reader = new CSVReader(new InputStreamReader(new FileInputStream(file), inputCharset), ';', '"'); //UTF-8?
		    	List<String[]> readIn = reader.readAll();
				reader.close();
				String[] headerline = readIn.get(0);
				readIn.remove(0);
				//assign colnumbers for columns needed
				int typecol=0;
				int codecol=1;
				int label_decol=2;
				int label_engcol=3;
				int clustercol=4;
				//and re-assign
				for (int i =0; i<headerline.length; i++) {
					if (headerline[i].equals("Type")) typecol=i;
					if (headerline[i].equals("Code")) codecol=i;
					if (headerline[i].equals("LabelDE")) label_decol=i;
					if (headerline[i].equals("LabelEN")) label_engcol=i;
					if (headerline[i].equals("Cluster")) clustercol=i;
				}
				
				if (readIn.size()==0 )
					throw new Exception("Configuration File " + file.getName() + "is empty");
				for (String[] nextline : readIn) {
					if (nextline.length>1) {
						code = MedicalGraph.readInNodeCode(nextline[codecol]);
						if (addPrefix2Label) {
							labelpre=code + " ";
						} else 
							labelpre="";
						if (label_decol<nextline.length) labelde=labelpre+ nextline[label_decol];
						if (label_engcol<nextline.length) labelen=labelpre+ nextline[label_engcol]; else labelen=labelde;
						if (clustercol<nextline.length) cluster=nextline[clustercol]; else cluster="";
						this.addLabel(code,labelde,labelen,nextline[typecol],cluster);
					}
				}
		    }
		}
	}
	
	public void addLabel (String code, String label_de, String label_eng, String typekey, String clusterkey) {
		NodeInfo l = new NodeInfo(code,label_de,label_eng, typekey, clusterkey);
		nodes_by_code.put(code,l);
	}
	
	public boolean codeExists(String code) {
		return nodes_by_code.containsKey(code);
	}
	
	public String getLabel4Code (Node node, boolean english) {
		if (nodes_by_code.containsKey(node.getCode())) return getLabel4Code (node.getCode(), english);
		if (nodes_by_code.containsKey(node.getAltCode())) return getLabel4Code (node.getAltCode(), english);
		return "";
	}
	
	public String getLabel4Code (String code, boolean english) {
		if (!nodes_by_code.containsKey(code)) return "";
		if (english)
			return nodes_by_code.get(code).label_eng;
		else return nodes_by_code.get(code).label_de;
	}
	
	public String getType4Code (Node node) {
		if (nodes_by_code.containsKey(node.getCode())) return getType4Code(node.getCode());
		if (nodes_by_code.containsKey(node.getAltCode())) return getType4Code(node.getAltCode());
		return "";
	}
	
	public String getType4Code (String code) {
		if (!nodes_by_code.containsKey(code)) return "";
		return nodes_by_code.get(code).typekey;
	}
	
	public String getCluster4Code (Node node) {
		if (nodes_by_code.containsKey(node.getCode())) return getCluster4Code(node.getCode());
		if (nodes_by_code.containsKey(node.getAltCode())) return getCluster4Code(node.getAltCode());
		return "";
	}
	
	public String getCluster4Code (String code) {
		if (!nodes_by_code.containsKey(code)) return "";
		return nodes_by_code.get(code).clusterkey;
	}
	
	public Map<String,ListResponse> getListByType(String type, boolean engl) {
		Map<String,ListResponse> list = new TreeMap<String,ListResponse>();
		for (NodeInfo node : nodes_by_code.values()) {
			if (node.typekey.equals(type))
				if (engl) list.put(node.code, new ListResponse(node.label_eng,node.clusterkey));
				else list.put(node.code, new ListResponse(node.label_de,node.clusterkey));
		}
		return list;
	} 

}
