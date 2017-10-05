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
