package ocl.monticoreocl.ocl._cocos;

import de.se_rwth.commons.logging.Log;


import ocl.monticoreocl.ocl._ast.ASTOCLConstructorSignature;
import ocl.monticoreocl.ocl._cocos.OCLASTOCLConstructorSignatureCoCo;

public class ConstructorNameStartsWithCapitalLetter implements OCLASTOCLConstructorSignatureCoCo {

	@Override
	public void check(ASTOCLConstructorSignature astConstructorSig){
		if (Character.isLowerCase(astConstructorSig.getReferenceType().charAt(0))) {
			Log.error(String.format("0xOCL10 constructor name '%s' after keyword 'new' cannot start in lower-case.", astConstructorSig.getReferenceType()),
					astConstructorSig.get_SourcePositionStart());
		}
	}
}