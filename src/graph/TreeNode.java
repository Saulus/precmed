package graph;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Set;

import graph.CreateResult.OnlineNode;

public class TreeNode {
	public String key;
	public String label;
	public LinkedHashMap<String,Object> children;
	
	
	public TreeNode(String key, String label) {
		this.key=key;
		this.label=label;
		this.children=new LinkedHashMap<String,Object>();  
	}
	
	public TreeNode(String key, String label, LinkedHashMap<String,Object> list) {
		this.key=key;
		this.label=label;
		this.children=list;
	}
	
	public void add(String key, Object a) {
		children.put(key,a);
	}
	
	
	class KeyComp implements Comparator<CreateResult.OnlineNode>{
	    @Override
	    public int compare(OnlineNode e1, OnlineNode e2) {
	    	return e1.key.compareToIgnoreCase(e2.key);
	    }
	}
	
	class LabelComp implements Comparator<CreateResult.OnlineNode>{
	    @Override
	    public int compare(OnlineNode e1, OnlineNode e2) {
	    	return e1.label.compareToIgnoreCase(e2.label);
	    }
	}
	
	
	public void addAll(List<CreateResult.OnlineNode> l, boolean sort) {
		
		List<CreateResult.OnlineNode> sortedList = new ArrayList<CreateResult.OnlineNode>(l);
		if (sort) {
		//	add sorted by key
			Collections.sort(sortedList, new KeyComp());
		}
		
		for (CreateResult.OnlineNode a : sortedList) {
			children.put(a.key,a);
		}
		
	}
	
	
	public void addAll(Collection<CreateResult.OnlineNode> l, boolean sort, boolean byLabel) {
		List<CreateResult.OnlineNode> sortedList = new ArrayList<CreateResult.OnlineNode>(l);
		if (sort) {
		//	add sorted by key
			if (byLabel) Collections.sort(sortedList, new LabelComp());
			else Collections.sort(sortedList, new KeyComp());
		}
		
		for (CreateResult.OnlineNode a : sortedList) {
			children.put(a.key,a);
		}
		
	}
	
	public Set<String> getChildrenKeys () {
		return children.keySet();
	}
	
	
}
