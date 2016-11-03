package graph;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import configuration.Consts;
import lists.ClusterLabels;
import lists.NodeLabels;

public class CreateResultDummy extends CreateResult {
	
	class DummyTreeNode {
		public String key;
		public String label;
		public HashMap<String,Object> children;
		
		public DummyTreeNode(String key, String label) {
			this.key=key;
			this.label=label;
			this.children=new HashMap<String,Object>(); 
		}
		
		public DummyTreeNode(String key, String label, HashMap<String,Object> list) {
			this.key=key;
			this.label=label;
			this.children=list;
		}
		
		public void add(String key, Object a) {
			children.put(key, a);
		}
		
	}
	
	
	public CreateResultDummy (NodeList nodes,EdgeList edges,NodeLabels nodelabels,ClusterLabels clusterlabels ) {
		super(nodes,edges,nodelabels,clusterlabels);
	}
	
	
	public TreeNode listNode(boolean english) {
		//create Node structure
		TreeNode newresult = new TreeNode("LIST","List");
		DummyTreeNode rel;
		DummyTreeNode abs;
		if (english) {
			rel = new DummyTreeNode("REL","Relative");
			abs = new DummyTreeNode("ABS","Absolute");
		} else {
			rel = new DummyTreeNode("REL","Relativ");
			abs = new DummyTreeNode("ABS","Absolut");
		}
		newresult.add(rel);
		newresult.add(abs);
		//has_successor
		
		unravelRiskNodes(rel,risks_relative,english);
		unravelRiskNodes(abs,risks,english);
		return newresult;
	}
	
	protected void unravelRiskNodes (DummyTreeNode root, List<OnlineNode> risklist, boolean english) {
		DummyTreeNode node ;
		DummyTreeNode subnode_risks;
		DummyTreeNode subnode_other;
		for (OnlineNode risk: risklist) {
			node = new DummyTreeNode(risk.key,risk.label);
			subnode_risks = new DummyTreeNode(Consts.riskRelationName,clusterlabels.getLabel4Code(Consts.riskRelationName, english));
			subnode_risks.add(risk.key,risk);
			node.add(subnode_risks.key,subnode_risks);
			
			for (String relation : other_relations.keySet()) {
				subnode_other= new DummyTreeNode(relation,clusterlabels.getLabel4Code(relation, english));
				for (OnlineNode on : other_relations.get(relation).get(risk)) {
					subnode_other.add(on.key,on);
				}
				node.add(subnode_other.key,subnode_other);
			}
			root.add(node.key,node);
		}
	}
	 

}
