package graph;

import java.util.ArrayList;
import java.util.Collection;

public class TreeNode {
	public String key;
	public String label;
	public ArrayList<Object> children;
	
	public TreeNode(String key, String label) {
		this.key=key;
		this.label=label;
		this.children=new ArrayList<Object>(); 
	}
	
	public TreeNode(String key, String label, ArrayList<Object> list) {
		this.key=key;
		this.label=label;
		this.children=list;
	}
	
	public void add(Object a) {
		children.add(a);
	}
	
	public Collection<Object> getChildren () {
		return children;
	}
	
	public int getChildId (Object o) {
		return children.indexOf(o);
	}
	
}
