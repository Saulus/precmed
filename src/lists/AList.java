package lists;

import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.util.LinkedHashMap;
import java.util.List;

import com.google.gson.Gson;
import au.com.bytecode.opencsv.CSVReader;

import configuration.ListTypeKonfig;


class Feature {
	public String label;
	public String cluster="";
	
	Feature() {}
}

public class AList {
	public LinkedHashMap<String,Feature> mylist_de;
	public LinkedHashMap<String,Feature> mylist_en; 
	public String myjson_de = "{}";
	public String myjson_en = "{}";
	
	public AList(String path, ListTypeKonfig type, Gson gson) throws Exception {
		mylist_de=readInList(path,type.addKeyPrefix, type.addKeySuffix, false, type.addCluster);
		mylist_en=readInList(path,type.addKeyPrefix, type.addKeySuffix, true, type.addCluster);
		
		myjson_de = gson.toJson(mylist_de);
		myjson_en = gson.toJson(mylist_en);
	}
	
	public LinkedHashMap<String,Feature> getList(boolean engl) {
		if (engl) return mylist_en;
		return mylist_de;
	}
	
	public String getJson(boolean engl) {
		if (engl) return myjson_en;
		return myjson_de;
	}
	
	public LinkedHashMap<String,Feature> readInList(String file, boolean addKeyPrefix, boolean addKeySuffix, boolean english, boolean addcluster) throws Exception {
		LinkedHashMap<String,Feature> mylist = new LinkedHashMap<String,Feature>();
		Charset inputCharset = Charset.forName("ISO-8859-1");
		CSVReader reader = new CSVReader(new InputStreamReader(new FileInputStream(file), inputCharset), ';', '"'); //UTF-8?
		List<String[]> readIn = reader.readAll();
		reader.close();
		//first line = header-line
		//String[] headerline = readIn.get(0);
		//assign colnumbers for columns needed
		Integer keycol=0;
		Integer valuecol=1;
		if (english) valuecol=2;
		Integer clustercol=3;
		readIn.remove(0);
		if (readIn.size()==0 )
			throw new Exception("Configuration File is empty");
		String key;
		Feature feature;
		for (String[] nextline : readIn) {
			if (nextline.length>1) {
				feature = new Feature();
				key= nextline[keycol].toUpperCase();
				feature.label = nextline[valuecol];
				if (addKeyPrefix) feature.label = key + " " + feature.label;
				if (addKeySuffix) feature.label = feature.label + " ("+key+")";
				if (addcluster && nextline.length>clustercol) feature.cluster=nextline[clustercol];
				mylist.put(key, feature);
			}
		}
		return mylist;
	}
	
	public boolean containsKey (String key) {
		return mylist_de.containsKey(key);
		
	}
	
	public String getName (String key, boolean english) {
		if (english) {
			if (!mylist_en.containsKey(key)) return "";
			return mylist_en.get(key).label;
		}
		else {
			if (!mylist_de.containsKey(key)) return "";
			return mylist_de.get(key).label;
		}
	}
	
	public String getClusterKey (String key) {
		//cluster (key) is similar ib all languages
		return mylist_en.get(key).cluster;
	}

}
