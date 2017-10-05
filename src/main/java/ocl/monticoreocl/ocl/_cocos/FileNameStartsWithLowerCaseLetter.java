package ocl.monticoreocl.ocl._cocos;

import de.se_rwth.commons.logging.Log;
import ocl.monticoreocl.ocl._ast.ASTOCLFile;

import ocl.monticoreocl.ocl._cocos.OCLASTOCLFileCoCo;

public class FileNameStartsWithLowerCaseLetter implements OCLASTOCLFileCoCo {

	@Override 
	public void check(ASTOCLFile astFile){
		String fileName = astFile.getFileName();
		boolean startsWithUpperCase = Character.isUpperCase(fileName.charAt(0));

		if (startsWithUpperCase) {
			// Issue warning...
			Log.warn(
					String.format("0xAUT02 State name '%s' should start with a capital letter.", fileName),
					astFile.get_SourcePositionStart());
		}
	}
}