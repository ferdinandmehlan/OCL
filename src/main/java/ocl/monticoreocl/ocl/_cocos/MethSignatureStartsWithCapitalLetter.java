package ocl.monticoreocl.ocl._cocos;

import de.se_rwth.commons.logging.Log;
import ocl.monticoreocl.ocl._ast.ASTOCLMethodSignature;
import ocl.monticoreocl.ocl._cocos.OCLASTOCLMethodSignatureCoCo;

public class MethSignatureStartsWithCapitalLetter implements OCLASTOCLMethodSignatureCoCo {

	@Override
	public void check(ASTOCLMethodSignature astMethSig){
		if (!Character.isLowerCase(astMethSig.getMethodName().charAt(0))) {
			Log.error(String.format("0xOCL10 Method '%s' must start in lower-case.", astMethSig.getMethodName()),
					astMethSig.get_SourcePositionStart());
		}
	}
}