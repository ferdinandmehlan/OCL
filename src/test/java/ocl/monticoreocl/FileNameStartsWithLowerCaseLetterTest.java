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

import java.util.Arrays;
import java.util.Collection;

import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;

import de.se_rwth.commons.SourcePosition;
import de.se_rwth.commons.logging.Finding;
import de.se_rwth.commons.logging.Log;
import ocl.monticoreocl.ocl._cocos.OCLCoCoChecker;
import ocl.monticoreocl.ocl._cocos.OCLCoCos;

public class FileNameStartsWithLowerCaseLetterTest extends AbstractOCLTest { 
	
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

	  @Test
	  public void invalidFileNameTest() {
	    String modelName = "example.cocos.invalid.invalidFileName";
	    String errorCode = "0xAUT02";
	    
	    Collection<Finding> expectedErrors = Arrays
	        .asList(
	        Finding.error(errorCode + " State name 'Association1' should start with a capital letter.",
	            new SourcePosition(1, 0))
	        );
	    testModelForErrors(PARENT_DIR, modelName, expectedErrors);
	  }
	  
	  @Test
	  public void validFileNameTest() {
		  
		  String modelName = "example.cocos.valid.validFileName";
		  testModelNoErrors(PARENT_DIR, modelName);
	  }
}
