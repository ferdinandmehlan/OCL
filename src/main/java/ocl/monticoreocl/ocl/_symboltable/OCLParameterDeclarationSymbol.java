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

package ocl.monticoreocl.ocl._symboltable;

import de.monticore.symboltable.CommonSymbol;
import de.monticore.types.types._ast.ASTType;

public class OCLParameterDeclarationSymbol extends CommonSymbol{

	public static final OCLParameterDeclarationKind KIND = OCLParameterDeclarationKind.INSTANCE;

	protected ASTType type;
	protected String className;
	protected String name;

	public OCLParameterDeclarationSymbol(String name) {
		super(name, KIND);
	}

	public void setType(ASTType type){
		this.type = type;

	}

	public ASTType getType(){
		return type;
	}

	public void setName(String name){
		this.name = name;

	}

	public String getName(){
		return name;
	}

	public void setClassName(String className){
		this.className=className;

	}

	public String getClassName(){
		return className;
	}
}