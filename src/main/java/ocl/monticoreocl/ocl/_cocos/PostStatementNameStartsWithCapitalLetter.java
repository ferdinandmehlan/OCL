package ocl.monticoreocl.ocl._cocos;

import de.se_rwth.commons.logging.Log;
import ocl.monticoreocl.ocl._ast.ASTOCLPostStatement;
import ocl.monticoreocl.ocl._cocos.OCLASTOCLPostStatementCoCo;

public class PostStatementNameStartsWithCapitalLetter implements OCLASTOCLPostStatementCoCo {

	@Override
	public void check(ASTOCLPostStatement astPostStatement){
		if (astPostStatement.nameIsPresent() && Character.isLowerCase(astPostStatement.getName().get().charAt(0))) {
			Log.error(String.format("0xOCL03 post condition name" + " '" + astPostStatement.getName().get() + "' " + "must start in upper-case."),
					astPostStatement.get_SourcePositionStart());
		}
	}
}