package ocl.monticoreocl.ocl._cocos;

import de.se_rwth.commons.logging.Log;



import ocl.monticoreocl.ocl._ast.ASTOCLParameterDeclaration;
import ocl.monticoreocl.ocl._cocos.OCLASTOCLParameterDeclarationCoCo;

public class ParameterDeclarationNameStartsWithLowerCaseLetter implements OCLASTOCLParameterDeclarationCoCo {

	@Override
	public void check(ASTOCLParameterDeclaration astParameterDeclaration){
		String parameterName = astParameterDeclaration.getVarName().get();
		boolean startsWithUpperCase = Character.isUpperCase(parameterName.charAt(0));

		if (startsWithUpperCase) {
			Log.error(String.format("0xOCL03 parameter name" + " '" + astParameterDeclaration.getVarName().get() + "' " + "cannot be written in upper-case letters."),
					astParameterDeclaration.get_SourcePositionStart());
		}
	}
}