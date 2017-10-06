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
package ocl.monticoreocl.ocl._cocos;

import de.se_rwth.commons.logging.Log;
import ocl.monticoreocl.ocl._ast.ASTOCLPreStatement;
import ocl.monticoreocl.ocl._cocos.OCLASTOCLPreStatementCoCo;

public class PreStatementNameStartsWithCapitalLetter implements OCLASTOCLPreStatementCoCo {

	@Override
	public void check(ASTOCLPreStatement astPreStatement){
		if (astPreStatement.getName().get() != null && Character.isLowerCase(astPreStatement.getName().get().charAt(0))) {
			Log.error(String.format("0xOCL03 pre condition name" + " '" + astPreStatement.getName().get() + "' " + "must start in upper-case."),
					astPreStatement.get_SourcePositionStart());
		}
	}
}