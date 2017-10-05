package ocl.monticoreocl;

import java.nio.file.Paths;

import ocl.monticoreocl.ocl._symboltable.OCLLanguage;
import de.monticore.ModelingLanguageFamily;
import de.monticore.io.paths.ModelPath;
import de.monticore.symboltable.GlobalScope;


public class OCLGlobalScopeTestFactory {
	public static GlobalScope create(String modelPath) {
		ModelingLanguageFamily fam = new ModelingLanguageFamily();
		fam.addModelingLanguage(new OCLLanguage());
		final ModelPath mp = new ModelPath(Paths.get(modelPath));
		GlobalScope scope = new GlobalScope(mp, fam);
		return scope;
	}
}
