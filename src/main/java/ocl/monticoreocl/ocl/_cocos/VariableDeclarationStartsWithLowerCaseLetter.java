package ocl.monticoreocl.ocl._cocos;

import de.se_rwth.commons.logging.Log;
import ocl.monticoreocl.ocl._ast.ASTOCLVariableDeclaration;
import ocl.monticoreocl.ocl._cocos.OCLASTOCLVariableDeclarationCoCo;

public class VariableDeclarationStartsWithLowerCaseLetter implements OCLASTOCLVariableDeclarationCoCo {

	@Override 
	public void check(ASTOCLVariableDeclaration astMethodDeclaration){
		String varName = astMethodDeclaration.getVarName().get();
		boolean startsWithUpperCase = Character.isUpperCase(varName.charAt(0));

		if (startsWithUpperCase) {
			// Issue warning...
			Log.warn(
					String.format("0xOCL06 variable declaration name '%s' should start with a lower-case letter.", varName),
					astMethodDeclaration.get_SourcePositionStart());
		}
	}
}