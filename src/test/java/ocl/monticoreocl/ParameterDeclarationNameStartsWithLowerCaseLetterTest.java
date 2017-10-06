/**
 * ******************************************************************************
 *  MontiCAR Modeling Family, www.se-rwth.de
 *  Copyright (c) 2017, Software Engineering Group at RWTH Aachen,
 *  All rights reserved.
 *
 *  This project is free software; you can redistribute it and/or
 *  modify it under the terms of the GNU Lesser General Public
 *  License as published by the Free Software Foundation; either
 *  version 3.0 of the License, or (at your option) any later version.
 *  This library is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 *  Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public
 *  License along with this project. If not, see <http://www.gnu.org/licenses/>.
 * *******************************************************************************
 */

package ocl.monticoreocl;

import static org.junit.Assert.*;

import java.util.Arrays;
import java.util.Collection;

import ocl.monticoreocl.ocl._cocos.OCLCoCoChecker;
import ocl.monticoreocl.ocl._cocos.OCLCoCos;

import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;

import de.se_rwth.commons.SourcePosition;
import de.se_rwth.commons.logging.Finding;
import de.se_rwth.commons.logging.Log;

public class ParameterDeclarationNameStartsWithLowerCaseLetterTest extends AbstractOCLTest {

	@Override
	  protected OCLCoCoChecker getChecker() {
		 return OCLCoCos.createChecker();
	  }
	  
	  @BeforeClass
	  public static void init() {
	    Log.enableFailQuick(false);
	  }
	  
	  @Before
	  public void setUp() {
	    Log.getFindings().clear();
	  }
	  
	  private static String MODEL_PATH_VALID = "src/test/resources/example/cocos/valid/";
	  
	  private static String MODEL_PATH_INVALID = "src/test/resources/example/cocos/invalid/";
	  
	  @Test
	  public void testInvalidParameterDeclarationName() {
	    String modelName = "invalidParameterDeclarationName.ocl";
	    String errorCode = "0xOCL03";
	    
	    Collection<Finding> expectedErrors = Arrays
	        .asList(
	       Finding.error(errorCode + " " + "parameter name 'Name' cannot be written in upper-case letters.",
	        	            new SourcePosition(2, 39))  
	        );
	    testModelForErrors(MODEL_PATH_INVALID + modelName, expectedErrors);
	  }
	  
	  
	  
	  @Test
	  public void testValidParameterDeclarationName() {
		  
		  String modelName = "validParameterDeclarationName.ocl";
		  testModelNoErrors(MODEL_PATH_VALID + modelName);
	  }

}
