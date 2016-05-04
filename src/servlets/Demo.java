package servlets;

import configuration.*;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;

import au.com.bytecode.opencsv.CSVReader;



/**
 * Servlet implementation class Risks
 * 
 * h2o classes go into: /WEB-INF/classes/
 * allmodels.csv goes into: /WEB-INF/allmodels.csv 
 */
@WebServlet("/Demo")
public class Demo extends HttpServlet {
	private static final long serialVersionUID = 1L;
	
	
	class Patient {
		public String AGE;
		public String GENDER;
		public ArrayList<String> ICD = new  ArrayList<String>();
		public ArrayList<String> ATC = new  ArrayList<String>();
		
		public Patient() {
			
		}
		
	}
	
	public static String myfile = Init.getWebInfPath() + "/"+Consts.demo_patients;
	private HashMap<String,Patient> demo_patients;
	private int noPatients=0;
	private boolean hasError = false;
	Gson gson = new Gson(); 
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public Demo() {
        super();

        try {
        	this.demo_patients=readInList(myfile);
        } catch (Exception e) {
        	System.err.println("Fehler gefunden beim Einlesen der Konfiguration aus Datei " + myfile );
			e.printStackTrace();
			this.hasError=true;
        }
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		response.addHeader("Access-Control-Allow-Origin", "*");
		response.addHeader("Content-Type", "application/json");
		response.setCharacterEncoding("UTF-8");
		
		if (hasError) response.sendError(520, "Init-Fehler");
		else {
			String pid = request.getParameter("patient");
			if (pid != null) {
				response.getWriter().append(gson.toJson(demo_patients.get(pid)));
			}
			else 
				//send number of patients
				response.getWriter().append(Integer.toString(noPatients));
			
		}
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		doGet(request, response);
	}
	
	private HashMap<String,Patient> readInList(String file) throws Exception {
		HashMap<String,Patient> mylist = new HashMap<String,Patient>();
		Charset inputCharset = Charset.forName("ISO-8859-1");
		CSVReader reader = new CSVReader(new InputStreamReader(new FileInputStream(file), inputCharset), ';', '"'); //UTF-8?
		List<String[]> readIn = reader.readAll();
		reader.close();
		//first line = header-line
		String[] headerline = readIn.get(0);
		//assign colnumbers for columns needed
		Integer pid = 0;
		String pid_s;
		readIn.remove(0);
		if (readIn.size()==0)
			throw new Exception("Configuration File is empty ");
		for (String[] nextline : readIn) {
			pid_s = Integer.toString(pid);
			if (!nextline[0].isEmpty()) {
				mylist.put(pid_s, new Patient());
				for (int i=0; i< nextline.length; i++) {
					if (!nextline[i].equals("0") && !nextline[i].isEmpty()) {
						//now add value patient based on header
						if (headerline[i].startsWith(Consts.alterattributeOrig))
							mylist.get(pid_s).AGE = nextline[i];
						else if (headerline[i].startsWith(Consts.geschlechtattributeOrig))
							mylist.get(pid_s).GENDER = nextline[i].substring(0, 1);
						else if (headerline[i].length()==3)
							mylist.get(pid_s).ICD.add(headerline[i]);
						else if (headerline[i].length()==5)
							mylist.get(pid_s).ATC.add(headerline[i]);
					}
				}
				pid++;
			}
		}
		this.noPatients = pid;
		return mylist;
	}
	

}
