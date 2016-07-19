package utils;

import java.io.BufferedWriter;
import java.io.FileReader;
import java.io.FileWriter;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;

import au.com.bytecode.opencsv.CSVReader;
import configuration.Consts;


class MatrixTarget {
	public String name;
	public String model_id;
	public double praevalenz;
	
	public MatrixTarget(String name, String id, String praev) {
		this.name=name;
		this.model_id = id;
		this.praevalenz = Double.parseDouble(praev);
	}
	
}

class Worker {
	private String allmodelfile;
	private String matrixfile; 
	private String seqfile;
	
	private HashMap<String,Integer> sequence = new HashMap<String,Integer>();
	
	public Worker (String inputfile, String matrixfile, String matrixfile_seq) {
		this.allmodelfile=inputfile;
		this.matrixfile=matrixfile;
		this.seqfile=matrixfile_seq;
	}
	
	
	public void process(int number_of_knr) throws Exception {
		System.out.println("Lese targets");
		  List<MatrixTarget> targets = readAllTargets(allmodelfile); //returns only if "isKnr" is true
		  
		  //Sortieren
		  Collections.sort(targets, new Comparator<MatrixTarget>() {
		        public int compare(MatrixTarget o1, MatrixTarget o2) {
		        	 return o1.praevalenz < o2.praevalenz ? -1
		        	         : o1.praevalenz > o2.praevalenz ? 1
		        	         : 0;
		        }
		    });
		  
		  //fill sequence
		  int last = number_of_knr;
		  if (last>targets.size()) last = targets.size();
		  String knr;
		  for (int i=0; i<last; i++) {
			  knr = stripKnr(targets.get(i).name, true);
			  sequence.put(knr, i);
		  }
		  
		  //create HashMap of target -> odds 
		  HashMap<String,double[]> targetodds = new  HashMap<String,double[]>();
		  for (String key : sequence.keySet()) {
			  System.out.println("Get Odds Ratios für: " + key);
			  targetodds.put(key, getOddsRatios(targets.get(sequence.get(key)).model_id));
		  }
		  
		  
		  System.out.println("Transpose Matrix");
		  double[][] matrix = transpose(targetodds,sequence);
		  //dump matrix to file
		  System.out.println("Dump Matrix");
		  BufferedWriter outputWriter = null;
		  outputWriter = new BufferedWriter(new FileWriter(matrixfile));
		  outputWriter.write(Arrays.deepToString(matrix));
		  outputWriter.close();
		  //dump sequence to file
		  System.out.println("Dump Sequence");
		  outputWriter = new BufferedWriter(new FileWriter(seqfile));
		  outputWriter.write("name");
		  outputWriter.newLine();
		  //bring in correct order
		  String[] seq_targets = new String[sequence.size()];
		  for (String target: sequence.keySet()) { 
			  seq_targets[sequence.get(target)]=target;
		  }
		  for (int i=0; i< seq_targets.length; i++) {
			  outputWriter.write(seq_targets[i]);
			  outputWriter.newLine();
		  }
		  outputWriter.close();
	}
	
	private double[][] transpose (HashMap<String,double[]> targetsodds, HashMap<String,Integer> sequence) {
		double[][] matrix = new double[sequence.size()][sequence.size()];
		int j;
		for (String target: targetsodds.keySet()) {
			j = sequence.get(target);
			for (int i=0; i< targetsodds.get(target).length; i++) {
				matrix[i][j]=targetsodds.get(target)[i];
			}
		}
		return matrix;
	}
	
	//returns: KNRxx
	 private String stripKnr (String key, boolean isTarget) {
		  if (isTarget)
			  return key.substring("T_".length());
		else return key;
	  }
	  
	  private boolean isKnr (String key, boolean isTarget) {
		  /*String praefix = Consts..knrattributePrefix;
		  if (isTarget) praefix = Consts.knrTargetPrefix;*/
		  boolean isNumber = true;
		  /*try {
			  if (!key.equals("ALTER") && !key.equals("GESCHLECHT")) {
				  @SuppressWarnings("unused")
				int i = Integer.parseInt(key.substring(praefix.length()));
			  }
		  } catch (NumberFormatException e) {
			  isNumber = false;
		  }*/
		  return isNumber;  
	  }
	  
	  private double[] getOddsRatios (String model_id) throws Exception {
		  	//hex.genmodel.GenModel rawModel = (hex.genmodel.GenModel) Class.forName(model_id).newInstance();
		    Field field = Class.forName(model_id+"_BETA").getDeclaredField("VALUES");
			field.setAccessible(true);
			double [] betas = (double []) field.get(null);
			
			field = Class.forName("NamesHolder_"+model_id).getDeclaredField("VALUES");
			field.setAccessible(true);
			String [] names = (String []) field.get(null);
		    
			//walk through, first: add to sequence
			//obsolete; Features and TARGETs are included beforehand (currently Targets only)
			/*
			for (int i=0; i< names.length; i++) {
				if (sequence.get(names[i]) == null && isKnr(names[i],false)) 
					sequence.put(names[i], sequence.size());
			}*/
			//now create double array of correct size
			double[] odds = new double[sequence.size()];
			
			//and now: fill it
			for (int i=0; i< names.length; i++) {
				if (sequence.get(names[i]) != null) {
					odds[sequence.get(names[i])] = Math.exp(betas[i]);
				}
			}
			
			return odds;
	  }
	  
	  private List<MatrixTarget> readAllTargets (String file) throws Exception {
		  List<MatrixTarget> mylist = new ArrayList<MatrixTarget>();
			//reads from csv: target;mean;auc_train;auc_test;model_id
			//system property: java -Dconfig.ehcfile="D:/all_models.csv"
			CSVReader reader = new CSVReader(new FileReader(allmodelfile), ';', '"');
			List<String[]> readIn = reader.readAll();
			reader.close();
			//first line = header-line
			String[] headerline = readIn.get(0);
			//assign colnumbers for columns needed
			Integer targetcol=null;
			Integer idcol=null;
			Integer praevcol=null;
			for (int j=0; j<headerline.length; j++) {
				/*if (headerline[j].trim().toUpperCase().equals(Consts.targetCol)) targetcol=j;
				if (headerline[j].trim().toUpperCase().equals(Consts.targetIDCol)) idcol=j;
				if (headerline[j].trim().toUpperCase().equals(Consts.targetPraevCol)) praevcol=j;*/
			}
			readIn.remove(0);
			if (targetcol == null || idcol==null || readIn.size()==0 )
				throw new Exception("Configuration File does not contain columns needed or is empty");

			for (String[] nextline : readIn) {
				if (!nextline[targetcol].isEmpty() && isKnr(nextline[targetcol].toUpperCase(),true)) {
					mylist.add(new MatrixTarget(nextline[targetcol].toUpperCase(),nextline[idcol],nextline[praevcol]));
				}
			}
			return mylist;
	  }
	
}


public class GenerateMatrix {
	
	
	private static final String dir = "C:\\Users\\hellwigp\\Documents\\4 Technology\\00 Development\\Risks\\WebContent\\WEB-INF\\classes";
	private static final String allmodelfile = dir + "\\all_models.csv"; 
	private static final String matrixfile = dir + "\\odds_ratios.txt";
	private static final String sequencefile = dir + "\\odds_ratios_KNRs.txt";
	
	private static final int maxKnr=100;
	
	
	//String modelClassName = "GLM_model_python_1446816023696_2";
	
	

	  public static void main(String[] args) throws Exception {
		  Worker myw = new Worker(allmodelfile,matrixfile,sequencefile);
		  try {
			  myw.process(maxKnr);
			  System.out.println("Erfolgreich");
		  } catch (Exception e) {
			  System.err.println("Nicht erfolgreich");
			  e.printStackTrace();
		  }
	 }
	  
	
	 

}
