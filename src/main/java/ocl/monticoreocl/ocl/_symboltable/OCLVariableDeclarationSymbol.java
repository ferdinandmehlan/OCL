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

import static de.monticore.symboltable.Symbols.sortSymbolsByPosition;

import java.util.Collection;

import de.monticore.symboltable.CommonScopeSpanningSymbol;
import de.monticore.types.types._ast.ASTType;

public class OCLVariableDeclarationSymbol extends CommonScopeSpanningSymbol {

	public static final OCLVariableDeclarationKind KIND = OCLVariableDeclarationKind.INSTANCE;

	protected String varName;
	protected ASTType type;
	protected String className;

	public OCLVariableDeclarationSymbol(String name) {
		super(name, KIND);
	}

	public void setName(String varName){
		this.varName = varName;

	}

	public String getName(){

		return varName;
	}

	public void setType(ASTType type){
		this.type = type;

	}

	public ASTType getType(){

		return type;
	}

	public void setClassName(String className){
		this.className = className;

	}

	public String getClassName(){

		return className;
	}

	public Collection<OCLVariableDeclarationSymbol> getOCLVariableDeclaration() {
		return sortSymbolsByPosition(getSpannedScope().resolveLocally(OCLVariableDeclarationSymbol.KIND));
	}
}
