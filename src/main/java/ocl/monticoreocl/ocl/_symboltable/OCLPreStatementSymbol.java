package ocl.monticoreocl.ocl._symboltable;

import de.monticore.symboltable.CommonSymbol;

public class OCLPreStatementSymbol extends CommonSymbol {

	public static final OCLPreStatementKind KIND = OCLPreStatementKind.INSTANCE;

	public OCLPreStatementSymbol(String name) {
		super(name, KIND);
	}
}
