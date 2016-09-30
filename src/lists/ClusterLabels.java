package lists;

import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.util.HashMap;
import java.util.List;

import au.com.bytecode.opencsv.CSVReader;

class Label {
	public String label_de;
	public String label_eng; 
	
	public Label (String de, String eng) {
		this.label_de=de;
		this.label_eng=eng;
	}
}

public class ClusterLabels {
	private HashMap<String,Label> labels = new HashMap<String,Label>();
	
	public ClusterLabels () {
	}
	
	public void readInList(String file) throws Exception {
		Charset inputCharset = Charset.forName("ISO-8859-1");
		CSVReader reader = new CSVReader(new InputStreamReader(new FileInputStream(file), inputCharset), ';', '"'); //UTF-8?
		List<String[]> readIn = reader.readAll();
		reader.close();
		//assign colnumbers for columns needed
		int codecol=0;
		int label_decol=1;
		int label_engcol=2;
		readIn.remove(0);
		if (readIn.size()==0 )
			throw new Exception("Configuration File " + file + "is empty");
		for (String[] nextline : readIn) {
			if (nextline.length>1) {
				this.addLabel(nextline[codecol],nextline[label_decol],nextline[label_engcol]);
			}
		}
	}
	
	public void addLabel(String code, String label_de, String label_eng) {
		Label l = new Label(label_de,label_eng);
		labels.put(code,l);
	}
	
	public String getLabel4Code (String code, boolean english) {
		if (!labels.containsKey(code)) return "";
		if (english)
			return labels.get(code).label_eng;
		else return labels.get(code).label_de;
	}

}
