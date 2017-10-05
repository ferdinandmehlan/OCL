package ocl.monticoreocl.ocl._cocos;

import de.se_rwth.commons.logging.Log;

import ocl.monticoreocl.ocl._ast.ASTOCLMethodDeclaration;

import ocl.monticoreocl.ocl._cocos.OCLASTOCLMethodDeclarationCoCo;

public class MethodDeclarationStartsWithLowerCaseLetter implements OCLASTOCLMethodDeclarationCoCo {

	@Override 
	public void check(ASTOCLMethodDeclaration astMethodDeclaration){
		String methName = astMethodDeclaration.getName().get();
		boolean startsWithUpperCase = Character.isUpperCase(methName.charAt(0));

		if (startsWithUpperCase) {
			// Issue warning...
			Log.warn(
					String.format("0xOCL06 method declaration name '%s' should start with a capital letter.", methName),
					astMethodDeclaration.get_SourcePositionStart());
		}
	}
}