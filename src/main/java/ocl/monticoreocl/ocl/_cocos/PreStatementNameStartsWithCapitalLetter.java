package ocl.monticoreocl.ocl._cocos;

import de.se_rwth.commons.logging.Log;
import ocl.monticoreocl.ocl._ast.ASTOCLPreStatement;
import ocl.monticoreocl.ocl._cocos.OCLASTOCLPreStatementCoCo;

public class PreStatementNameStartsWithCapitalLetter implements OCLASTOCLPreStatementCoCo {

	@Override
	public void check(ASTOCLPreStatement astPreStatement){
		if (astPreStatement.getName().get() != null && Character.isLowerCase(astPreStatement.getName().get().charAt(0))) {
			Log.error(String.format("0xOCL03 pre condition name" + " '" + astPreStatement.getName().get() + "' " + "must start in upper-case."),
					astPreStatement.get_SourcePositionStart());
		}
	}
}