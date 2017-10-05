package ocl.monticoreocl.ocl._symboltable;

import static de.monticore.symboltable.Symbols.sortSymbolsByPosition;

import java.util.Collection;
import java.util.Optional;

import de.monticore.symboltable.CommonScopeSpanningSymbol;

public class OCLMethodDeclarationSymbol extends CommonScopeSpanningSymbol {

	public static final OCLMethodDeclarationKind KIND = OCLMethodDeclarationKind.INSTANCE;

	public OCLMethodDeclarationSymbol(String name) {
		super(name, KIND);
	}

	protected String returnType;

	public void setReturnType(String returnType){
		this.returnType = returnType; 

	}

	public String getReturnType(){
		return returnType;
	}

	public Collection<OCLMethodDeclarationSymbol> getOCLMethodDeclaration() {
		return sortSymbolsByPosition(getSpannedScope().resolveLocally(OCLMethodDeclarationSymbol.KIND));
	}
	
	public Optional<OCLParameterDeclarationSymbol> getOCLParamDecl(String name) {
		return getSpannedScope().resolve(name, OCLParameterDeclarationSymbol.KIND);
	}

	public Collection<OCLParameterDeclarationSymbol> getOCLParamDecl() {
		return sortSymbolsByPosition(getSpannedScope().resolveLocally(OCLParameterDeclarationSymbol.KIND));
	}
}
