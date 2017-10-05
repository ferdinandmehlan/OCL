
package ocl.monticoreocl.ocl._cocos;

import de.se_rwth.commons.logging.Log;
import ocl.monticoreocl.ocl._ast.ASTOCLInvariant;

import ocl.monticoreocl.ocl._cocos.OCLASTOCLInvariantCoCo;

public class InvariantNameStartsWithCapitalLetter implements OCLASTOCLInvariantCoCo {

	@Override
	public void check(ASTOCLInvariant astInv){
		if (astInv.nameIsPresent() && Character.isLowerCase(astInv.getName().get().charAt(0))) {
			Log.error(String.format("0xOCL02 invariant name" + " '" + astInv.getName().get() + "' " + "cannot start in lower-case."),
					astInv.get_SourcePositionStart());
		}

	}
}
