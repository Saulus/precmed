package graph;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
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
	
	
	class ListComp implements Comparator<CreateResult.OnlineNode>{
	    @Override
	    public int compare(OnlineNode e1, OnlineNode e2) {
	    	return e1.key.compareTo(e2.key);
	    }
	}
	
	
	public void addAll(List<CreateResult.OnlineNode> l, boolean sort) {
		
		List<CreateResult.OnlineNode> sortedList = new ArrayList<CreateResult.OnlineNode>(l);
		if (sort) {
		//	add sorted by key
			Collections.sort(sortedList, new ListComp());
		}
		
		for (CreateResult.OnlineNode a : sortedList) {
			children.put(a.key,a);
		}
		
	}
	
	
	public void addAll(HashSet<CreateResult.OnlineNode> l, boolean sort) {
		List<CreateResult.OnlineNode> sortedList = new ArrayList<CreateResult.OnlineNode>(l);
		if (sort) {
		//	add sorted by key
			Collections.sort(sortedList, new ListComp());
		}
		
		for (CreateResult.OnlineNode a : sortedList) {
			children.put(a.key,a);
		}
		
	}
	
	public Set<String> getChildrenKeys () {
		return children.keySet();
	}
	
	
}
