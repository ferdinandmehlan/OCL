package ocl.monticoreocl.ocl._cocos;

import ocl.monticoreocl.ocl._cocos.OCLCoCoChecker;;

public class OCLCoCos {

	public static OCLCoCoChecker createChecker() {
		return new OCLCoCoChecker()
		.addCoCo(new FileNameStartsWithLowerCaseLetter())
		.addCoCo(new MethSignatureStartsWithCapitalLetter())
		.addCoCo(new ConstructorNameStartsWithCapitalLetter())
		.addCoCo(new InvariantNameStartsWithCapitalLetter())
		.addCoCo(new MethodDeclarationStartsWithLowerCaseLetter())
		.addCoCo(new PreStatementNameStartsWithCapitalLetter())
		.addCoCo(new PostStatementNameStartsWithCapitalLetter())
		.addCoCo(new ParameterDeclarationNameStartsWithLowerCaseLetter());
	}
}